package com.falconsvsvabro.ecocampus.auth;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.falconsvsvabro.ecocampus.common.api.BusinessException;
import com.falconsvsvabro.ecocampus.common.api.ErrorCode;
import com.falconsvsvabro.ecocampus.user.User;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

	private static final String HMAC_SHA256 = "HmacSHA256";
	private static final TypeReference<Map<String, Object>> MAP_TYPE = new TypeReference<>() {
	};

	private final ObjectMapper objectMapper;
	private final byte[] secret;

	public JwtService(ObjectMapper objectMapper,
			@Value("${ecocampus.security.jwt-secret:dev-only-ecocampus-secret-change-me}") String secret) {
		this.objectMapper = objectMapper;
		this.secret = secret.getBytes(StandardCharsets.UTF_8);
	}

	public String createAccessToken(User user) {
		return createToken(user, "access", 60 * 60 * 2);
	}

	public String createRefreshToken(User user) {
		return createToken(user, "refresh", 60 * 60 * 24 * 14);
	}

	public Long parseAccessUserId(String token) {
		Map<String, Object> payload = parse(token);
		if (!"access".equals(payload.get("type"))) {
			throw new BusinessException(ErrorCode.UNAUTHORIZED, "invalid token type");
		}
		return Long.valueOf((String) payload.get("sub"));
	}

	private String createToken(User user, String type, long ttlSeconds) {
		Instant now = Instant.now();
		Map<String, Object> header = new LinkedHashMap<>();
		header.put("alg", "HS256");
		header.put("typ", "JWT");

		Map<String, Object> payload = new LinkedHashMap<>();
		payload.put("sub", user.getId().toString());
		payload.put("type", type);
		payload.put("role", user.getRole().name());
		payload.put("iat", now.getEpochSecond());
		payload.put("exp", now.plusSeconds(ttlSeconds).getEpochSecond());

		String unsigned = encodeJson(header) + "." + encodeJson(payload);
		return unsigned + "." + base64Url(hmac(unsigned));
	}

	private Map<String, Object> parse(String token) {
		String[] parts = token.split("\\.");
		if (parts.length != 3) {
			throw new BusinessException(ErrorCode.UNAUTHORIZED, "invalid token");
		}
		String unsigned = parts[0] + "." + parts[1];
		if (!base64Url(hmac(unsigned)).equals(parts[2])) {
			throw new BusinessException(ErrorCode.UNAUTHORIZED, "invalid token signature");
		}
		try {
			Map<String, Object> payload = objectMapper.readValue(base64UrlDecode(parts[1]), MAP_TYPE);
			Number expiresAt = (Number) payload.get("exp");
			if (expiresAt == null || expiresAt.longValue() <= Instant.now().getEpochSecond()) {
				throw new BusinessException(ErrorCode.UNAUTHORIZED, "token expired");
			}
			return payload;
		}
		catch (JsonProcessingException exception) {
			throw new BusinessException(ErrorCode.UNAUTHORIZED, "invalid token payload");
		}
		catch (IOException exception) {
			throw new BusinessException(ErrorCode.UNAUTHORIZED, "invalid token payload");
		}
	}

	private String encodeJson(Map<String, Object> value) {
		try {
			return base64Url(objectMapper.writeValueAsBytes(value));
		}
		catch (JsonProcessingException exception) {
			throw new IllegalStateException("Failed to encode token", exception);
		}
	}

	private byte[] hmac(String value) {
		try {
			Mac mac = Mac.getInstance(HMAC_SHA256);
			mac.init(new SecretKeySpec(secret, HMAC_SHA256));
			return mac.doFinal(value.getBytes(StandardCharsets.UTF_8));
		}
		catch (Exception exception) {
			throw new IllegalStateException("Failed to sign token", exception);
		}
	}

	private String base64Url(byte[] value) {
		return Base64.getUrlEncoder().withoutPadding().encodeToString(value);
	}

	private byte[] base64UrlDecode(String value) {
		return Base64.getUrlDecoder().decode(value);
	}
}
