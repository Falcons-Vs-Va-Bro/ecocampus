package com.falconsvsvabro.ecocampus.auth;

import com.falconsvsvabro.ecocampus.auth.dto.CampusVerificationRequest;
import com.falconsvsvabro.ecocampus.auth.dto.LoginResponse;
import com.falconsvsvabro.ecocampus.auth.dto.MeResponse;
import com.falconsvsvabro.ecocampus.common.api.BusinessException;
import com.falconsvsvabro.ecocampus.common.api.ErrorCode;
import com.falconsvsvabro.ecocampus.user.User;
import com.falconsvsvabro.ecocampus.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

	private final SmsCodeService smsCodeService;
	private final JwtService jwtService;
	private final UserRepository userRepository;

	public AuthService(SmsCodeService smsCodeService, JwtService jwtService, UserRepository userRepository) {
		this.smsCodeService = smsCodeService;
		this.jwtService = jwtService;
		this.userRepository = userRepository;
	}

	public void sendSmsCode(String phone) {
		smsCodeService.send(phone);
	}

	@Transactional
	public LoginResponse login(String phone, String code) {
		smsCodeService.verify(phone, code);
		User user = userRepository.findByPhone(phone).orElseGet(() -> userRepository.save(User.registerByPhone(phone)));
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

	private User getUser(Long userId) {
		return userRepository.findById(userId)
			.orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED, "current user not found"));
	}

}
