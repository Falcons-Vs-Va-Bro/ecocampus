package com.falconsvsvabro.ecocampus.auth.dto;

public record PhoneVerificationCodeResponse(String maskedPhone, String demoCode, int expiresInSeconds,
		int resendAfterSeconds, String deliveryMessage) {
}
