package com.falconsvsvabro.ecocampus.auth;

import com.falconsvsvabro.ecocampus.auth.dto.CampusVerificationRequest;
import com.falconsvsvabro.ecocampus.auth.dto.LoginResponse;
import com.falconsvsvabro.ecocampus.auth.dto.MeResponse;
import com.falconsvsvabro.ecocampus.common.api.BusinessException;
import com.falconsvsvabro.ecocampus.common.api.ErrorCode;
import com.falconsvsvabro.ecocampus.user.User;
import com.falconsvsvabro.ecocampus.user.UserRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

	private final JwtService jwtService;
	private final UserRepository userRepository;
	private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

	public AuthService(JwtService jwtService, UserRepository userRepository) {
		this.jwtService = jwtService;
		this.userRepository = userRepository;
	}

	@Transactional
	public LoginResponse login(String account, String password) {
		User user = userRepository.findByPhone(account).orElseGet(() -> createUser(account, password));
		if (!user.matchesPassword(passwordEncoder, password)) {
			throw new BusinessException(ErrorCode.UNAUTHORIZED, "invalid account or password");
		}
		return toLoginResponse(user);
	}

	@Transactional
	public MeResponse verifyCampusIdentity(Long userId, CampusVerificationRequest request) {
		User user = getUser(userId);
		if (user.isBlacklisted()) {
			throw new BusinessException(ErrorCode.BLACKLISTED);
		}
		if (userRepository.existsByStudentNoAndIdNot(request.studentNo(), user.getId())) {
			throw new BusinessException(ErrorCode.CONFLICT, "student number already verified");
		}
		user.verifyCampusIdentity(request.realName(), request.studentNo(), request.college(), request.grade());
		return toMeResponse(user);
	}

	@Transactional(readOnly = true)
	public MeResponse getMe(Long userId) {
		return toMeResponse(getUser(userId));
	}

	private LoginResponse toLoginResponse(User user) {
		return new LoginResponse(jwtService.createAccessToken(user), jwtService.createRefreshToken(user),
				new LoginResponse.LoginUser(user.getId(), user.getRole(), user.getVerificationStatus()));
	}

	private MeResponse toMeResponse(User user) {
		return MeResponse.from(user);
	}

	private User createUser(String account, String password) {
		try {
			return userRepository.saveAndFlush(User.registerByAccount(account, passwordEncoder.encode(password)));
		}
		catch (DataIntegrityViolationException exception) {
			User existing = userRepository.findByPhone(account)
				.orElseThrow(() -> new BusinessException(ErrorCode.CONFLICT, "account already exists"));
			if (!existing.matchesPassword(passwordEncoder, password)) {
				throw new BusinessException(ErrorCode.UNAUTHORIZED, "invalid account or password");
			}
			return existing;
		}
	}

	private User getUser(Long userId) {
		return userRepository.findById(userId)
			.orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED, "current user not found"));
	}

}
