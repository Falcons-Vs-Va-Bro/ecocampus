package com.falconsvsvabro.ecocampus.user.dto;

import com.falconsvsvabro.ecocampus.user.Address;

public record AddressResponse(Long id, String receiverName, String receiverPhone, String campusArea, String detail,
		boolean isDefault) {

	public static AddressResponse from(Address address) {
		return new AddressResponse(address.getId(), address.getReceiverName(), address.getReceiverPhone(),
				address.getCampusArea(), address.getDetail(), address.isDefaultAddress());
	}
}
