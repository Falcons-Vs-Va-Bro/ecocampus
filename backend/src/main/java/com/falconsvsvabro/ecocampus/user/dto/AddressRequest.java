package com.falconsvsvabro.ecocampus.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AddressRequest(
		@NotBlank @Size(max = 40) String receiverName,
		@NotBlank @Pattern(regexp = "1\\d{10}") String receiverPhone,
		@NotBlank @Size(max = 80) String campusArea,
		@NotBlank @Size(max = 255) String detail,
		Boolean isDefault) {
}
