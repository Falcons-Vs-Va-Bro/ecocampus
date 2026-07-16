package com.falconsvsvabro.ecocampus.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record PhoneVerificationCodeRequest(
		@NotBlank @Pattern(regexp = "1[3-9]\\d{9}") String mobilePhone) {
}
