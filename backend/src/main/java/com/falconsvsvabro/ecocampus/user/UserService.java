package com.falconsvsvabro.ecocampus.user;

import com.falconsvsvabro.ecocampus.auth.CampusAccessGuard;
import com.falconsvsvabro.ecocampus.auth.dto.MeResponse;
import com.falconsvsvabro.ecocampus.common.api.BusinessException;
import com.falconsvsvabro.ecocampus.common.api.ErrorCode;
import com.falconsvsvabro.ecocampus.user.dto.AddressRequest;
import com.falconsvsvabro.ecocampus.user.dto.AddressResponse;
import com.falconsvsvabro.ecocampus.user.dto.UpdateProfileRequest;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

	private final CampusAccessGuard campusAccessGuard;
	private final AddressRepository addressRepository;

	public UserService(CampusAccessGuard campusAccessGuard, AddressRepository addressRepository) {
		this.campusAccessGuard = campusAccessGuard;
		this.addressRepository = addressRepository;
	}

	@Transactional
	public MeResponse updateProfile(Long userId, UpdateProfileRequest request) {
		User user = campusAccessGuard.requireUser(userId);
		if (user.isBlacklisted()) {
			throw new BusinessException(ErrorCode.BLACKLISTED);
		}
		user.updateProfile(request.nickname(), request.avatarUrl());
		return MeResponse.from(user);
	}

	@Transactional(readOnly = true)
	public List<AddressResponse> listAddresses(Long userId) {
		User user = campusAccessGuard.requireVerifiedUser(userId);
		return addressRepository.findByUserIdOrderByDefaultAddressDescIdDesc(user.getId())
			.stream()
			.map(AddressResponse::from)
			.toList();
	}

	@Transactional
	public AddressResponse createAddress(Long userId, AddressRequest request) {
		User user = campusAccessGuard.requireVerifiedUser(userId);
		List<Address> lockedAddresses = addressRepository.findByUserIdForUpdate(user.getId());
		boolean firstAddress = lockedAddresses.isEmpty();
		boolean defaultAddress = firstAddress || Boolean.TRUE.equals(request.isDefault());
		if (defaultAddress) {
			clearDefaultAddress(lockedAddresses);
			addressRepository.flush();
		}
		Address address = new Address(user.getId(), request.receiverName(), request.receiverPhone(),
				request.campusArea(), request.detail(), defaultAddress);
		return AddressResponse.from(addressRepository.save(address));
	}

	@Transactional
	public AddressResponse updateAddress(Long userId, Long addressId, AddressRequest request) {
		User user = campusAccessGuard.requireVerifiedUser(userId);
		List<Address> lockedAddresses = addressRepository.findByUserIdForUpdate(user.getId());
		Address address = getOwnedAddress(lockedAddresses, addressId);
		boolean defaultAddress = Boolean.TRUE.equals(request.isDefault());
		if (defaultAddress) {
			clearDefaultAddress(lockedAddresses);
			addressRepository.flush();
		}
		address.update(request.receiverName(), request.receiverPhone(), request.campusArea(), request.detail(),
				defaultAddress);
		return AddressResponse.from(address);
	}

	@Transactional
	public void deleteAddress(Long userId, Long addressId) {
		User user = campusAccessGuard.requireVerifiedUser(userId);
		List<Address> lockedAddresses = addressRepository.findByUserIdForUpdate(user.getId());
		Address address = getOwnedAddress(lockedAddresses, addressId);
		boolean wasDefault = address.isDefaultAddress();
		if (wasDefault) {
			address.setDefaultAddress(false);
		}
		addressRepository.delete(address);
		addressRepository.flush();
		if (wasDefault) {
			lockedAddresses.stream()
				.filter(nextAddress -> !nextAddress.getId().equals(addressId))
				.findFirst()
				.ifPresent(nextDefault -> nextDefault.setDefaultAddress(true));
		}
	}

	private Address getOwnedAddress(List<Address> lockedAddresses, Long addressId) {
		return lockedAddresses.stream()
			.filter(address -> address.getId().equals(addressId))
			.findFirst()
			.orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "address not found"));
	}

	private void clearDefaultAddress(List<Address> lockedAddresses) {
		lockedAddresses.forEach(address -> address.setDefaultAddress(false));
	}
}
