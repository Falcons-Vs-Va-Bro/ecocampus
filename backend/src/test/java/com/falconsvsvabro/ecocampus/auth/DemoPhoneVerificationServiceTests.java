package com.falconsvsvabro.ecocampus.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.falconsvsvabro.ecocampus.common.api.BusinessException;
import org.junit.jupiter.api.Test;

class DemoPhoneVerificationServiceTests {

	@Test
	void issuedCodeCanBeConsumedOnlyOnce() {
		DemoPhoneVerificationService service = new DemoPhoneVerificationService();
		var response = service.issue(42L, "13800006721");

		assertThat(response.maskedPhone()).isEqualTo("138****6721");
		assertThat(response.demoCode()).matches("\\d{6}");
		assertThat(response.expiresInSeconds()).isEqualTo(300);

		service.consume(42L, "13800006721", response.demoCode());
		assertThatThrownBy(() -> service.consume(42L, "13800006721", response.demoCode()))
			.isInstanceOf(BusinessException.class)
			.hasMessageContaining("request a phone verification code first");
	}

	@Test
	void wrongPhoneOrCodeCannotConsumeChallenge() {
		DemoPhoneVerificationService service = new DemoPhoneVerificationService();
		var response = service.issue(43L, "13900006721");
		String wrongCode = response.demoCode().equals("000000") ? "000001" : "000000";

		assertThatThrownBy(() -> service.consume(43L, "13900006722", response.demoCode()))
			.isInstanceOf(BusinessException.class)
			.hasMessageContaining("invalid phone verification code");
		assertThatThrownBy(() -> service.consume(43L, "13900006721", wrongCode))
			.isInstanceOf(BusinessException.class)
			.hasMessageContaining("invalid phone verification code");
	}
}
