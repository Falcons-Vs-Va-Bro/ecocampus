package com.falconsvsvabro.ecocampus.auth.dto;

import com.falconsvsvabro.ecocampus.user.UserRole;
import com.falconsvsvabro.ecocampus.user.VerificationStatus;

public record MeResponse(Long id, String nickname, String phone, UserRole role, VerificationStatus verificationStatus,
		String studentNoMasked) {
}
