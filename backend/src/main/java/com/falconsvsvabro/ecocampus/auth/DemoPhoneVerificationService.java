package com.falconsvsvabro.ecocampus.auth;

import com.falconsvsvabro.ecocampus.auth.dto.PhoneVerificationCodeResponse;
import com.falconsvsvabro.ecocampus.common.api.BusinessException;
import com.falconsvsvabro.ecocampus.common.api.ErrorCode;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Service;

/**
 * Classroom-only phone-code simulator. The returned code is deliberately visible
 * to the caller and must never be described as real SMS verification.
 */
@Service
public class DemoPhoneVerificationService {

	private static final Duration CODE_TTL = Duration.ofMinutes(5);
	private static final Duration RESEND_COOLDOWN = Duration.ofSeconds(45);

	private final ConcurrentHashMap<Long, Challenge> challenges = new ConcurrentHashMap<>();
	private final SecureRandom secureRandom = new SecureRandom();

	public PhoneVerificationCodeResponse issue(Long userId, String mobilePhone) {
		Instant now = Instant.now();
		Challenge current = challenges.get(userId);
		if (current != null && current.resendAt().isAfter(now)) {
			long remaining = Math.max(1, Duration.between(now, current.resendAt()).toSeconds());
			throw new BusinessException(ErrorCode.CONFLICT, "please wait " + remaining + " seconds before resending");
		}

		String code = "%06d".formatted(secureRandom.nextInt(1_000_000));
		challenges.put(userId, new Challenge(mobilePhone, code, now.plus(CODE_TTL), now.plus(RESEND_COOLDOWN)));
		return new PhoneVerificationCodeResponse(maskPhone(mobilePhone), code, (int) CODE_TTL.toSeconds(),
				(int) RESEND_COOLDOWN.toSeconds(), "厦大白鹭短信站已送达课堂演示码");
	}

	public void consume(Long userId, String mobilePhone, String code) {
		Challenge challenge = challenges.get(userId);
		if (challenge == null) {
			throw new BusinessException(ErrorCode.BAD_REQUEST, "request a phone verification code first");
		}
		if (challenge.expiresAt().isBefore(Instant.now())) {
			challenges.remove(userId, challenge);
			throw new BusinessException(ErrorCode.BAD_REQUEST, "phone verification code expired");
		}
		if (!challenge.mobilePhone().equals(mobilePhone) || !challenge.code().equals(code)) {
			throw new BusinessException(ErrorCode.BAD_REQUEST, "invalid phone verification code");
		}
		challenges.remove(userId, challenge);
	}

	private String maskPhone(String phone) {
		return phone.substring(0, 3) + "****" + phone.substring(phone.length() - 4);
	}

	private record Challenge(String mobilePhone, String code, Instant expiresAt, Instant resendAt) {
	}
}
