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
		boolean firstAddress = !addressRepository.existsByUserId(user.getId());
		boolean defaultAddress = firstAddress || Boolean.TRUE.equals(request.isDefault());
		if (defaultAddress) {
			clearDefaultAddress(user.getId());
		}
		Address address = new Address(user.getId(), request.receiverName(), request.receiverPhone(),
				request.campusArea(), request.detail(), defaultAddress);
		return AddressResponse.from(addressRepository.save(address));
	}

	@Transactional
	public AddressResponse updateAddress(Long userId, Long addressId, AddressRequest request) {
		User user = campusAccessGuard.requireVerifiedUser(userId);
		Address address = getOwnedAddress(user.getId(), addressId);
		boolean defaultAddress = Boolean.TRUE.equals(request.isDefault());
		if (defaultAddress) {
			clearDefaultAddress(user.getId());
		}
		address.update(request.receiverName(), request.receiverPhone(), request.campusArea(), request.detail(),
				defaultAddress);
		return AddressResponse.from(address);
	}

	@Transactional
	public void deleteAddress(Long userId, Long addressId) {
		User user = campusAccessGuard.requireVerifiedUser(userId);
		Address address = getOwnedAddress(user.getId(), addressId);
		boolean wasDefault = address.isDefaultAddress();
		addressRepository.delete(address);
		if (wasDefault) {
			addressRepository.findByUserIdOrderByDefaultAddressDescIdDesc(user.getId())
				.stream()
				.findFirst()
				.ifPresent(nextDefault -> nextDefault.setDefaultAddress(true));
		}
	}

	private Address getOwnedAddress(Long userId, Long addressId) {
		return addressRepository.findByIdAndUserId(addressId, userId)
			.orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "address not found"));
	}

	private void clearDefaultAddress(Long userId) {
		addressRepository.findByUserIdOrderByDefaultAddressDescIdDesc(userId)
			.forEach(address -> address.setDefaultAddress(false));
	}
}
