package com.falconsvsvabro.ecocampus.auth;

import com.falconsvsvabro.ecocampus.common.api.BusinessException;
import com.falconsvsvabro.ecocampus.common.api.ErrorCode;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Service;

@Service
public class SmsCodeService {

	static final int EXPIRES_IN_SECONDS = 300;

	private static final String LOCAL_DEV_CODE = "123456";

	private final Map<String, SmsCodeChallenge> challenges = new ConcurrentHashMap<>();

	public void send(String phone) {
		challenges.put(phone, new SmsCodeChallenge(LOCAL_DEV_CODE, Instant.now().plusSeconds(EXPIRES_IN_SECONDS)));
	}

	public void verify(String phone, String code) {
		SmsCodeChallenge challenge = challenges.get(phone);
		if (challenge == null || challenge.expiresAt().isBefore(Instant.now()) || !challenge.code().equals(code)) {
			throw new BusinessException(ErrorCode.UNAUTHORIZED, "invalid sms code");
		}
		challenges.remove(phone);
	}

	private record SmsCodeChallenge(String code, Instant expiresAt) {
	}
}
