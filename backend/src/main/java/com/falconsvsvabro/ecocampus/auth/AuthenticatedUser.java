package com.falconsvsvabro.ecocampus.auth;

import com.falconsvsvabro.ecocampus.user.UserRole;
import com.falconsvsvabro.ecocampus.user.VerificationStatus;

public record AuthenticatedUser(Long id, UserRole role, VerificationStatus verificationStatus) {
}
