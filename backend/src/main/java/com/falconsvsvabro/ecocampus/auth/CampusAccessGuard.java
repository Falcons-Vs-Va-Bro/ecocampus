package com.falconsvsvabro.ecocampus.auth;

import com.falconsvsvabro.ecocampus.common.api.BusinessException;
import com.falconsvsvabro.ecocampus.common.api.ErrorCode;
import com.falconsvsvabro.ecocampus.user.User;
import com.falconsvsvabro.ecocampus.user.UserRepository;
import com.falconsvsvabro.ecocampus.user.VerificationStatus;
import org.springframework.stereotype.Component;

@Component
public class CampusAccessGuard {

	private final UserRepository userRepository;

	public CampusAccessGuard(UserRepository userRepository) {
		this.userRepository = userRepository;
	}

	public User requireUser(Long userId) {
		return userRepository.findById(userId)
			.orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED, "current user not found"));
	}

	public User requireVerifiedUser(Long userId) {
		User user = requireUser(userId);
		if (user.isBlacklisted()) {
			throw new BusinessException(ErrorCode.BLACKLISTED);
		}
		if (user.getVerificationStatus() != VerificationStatus.VERIFIED) {
			throw new BusinessException(ErrorCode.FORBIDDEN, "campus verification required");
		}
		return user;
	}
}
