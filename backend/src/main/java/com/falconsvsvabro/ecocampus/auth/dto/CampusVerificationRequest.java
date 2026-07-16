package com.falconsvsvabro.ecocampus.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CampusVerificationRequest(
		@NotBlank @Size(max = 40) String realName,
		@NotBlank @Pattern(regexp = "\\d{8,20}") String studentNo,
		@NotBlank @Size(max = 80) String college,
		@NotBlank @Size(max = 20) String grade,
		@Pattern(regexp = "1[3-9]\\d{9}") String mobilePhone,
		@Pattern(regexp = "\\d{6}") String verificationCode) {
}
