package com.falconsvsvabro.ecocampus.auth.dto;

import com.falconsvsvabro.ecocampus.user.UserRole;
import com.falconsvsvabro.ecocampus.user.VerificationStatus;

public record LoginResponse(String accessToken, String refreshToken, LoginUser user) {

	public record LoginUser(Long id, UserRole role, VerificationStatus verificationStatus) {
	}
}
