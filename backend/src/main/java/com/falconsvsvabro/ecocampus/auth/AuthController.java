package com.falconsvsvabro.ecocampus.auth;

import com.falconsvsvabro.ecocampus.auth.dto.CampusVerificationRequest;
import com.falconsvsvabro.ecocampus.auth.dto.LoginRequest;
import com.falconsvsvabro.ecocampus.auth.dto.LoginResponse;
import com.falconsvsvabro.ecocampus.auth.dto.MeResponse;
import com.falconsvsvabro.ecocampus.auth.dto.SendSmsCodeRequest;
import com.falconsvsvabro.ecocampus.auth.dto.SendSmsCodeResponse;
import com.falconsvsvabro.ecocampus.common.api.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

	private final AuthService authService;

	public AuthController(AuthService authService) {
		this.authService = authService;
	}

	@PostMapping("/sms-code")
	ApiResponse<SendSmsCodeResponse> sendSmsCode(@Valid @RequestBody SendSmsCodeRequest request,
			HttpServletRequest httpRequest) {
		authService.sendSmsCode(request.phone());
		return ApiResponse.ok(new SendSmsCodeResponse(SmsCodeService.EXPIRES_IN_SECONDS), traceId(httpRequest));
	}

	@PostMapping("/login")
	ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest) {
		return ApiResponse.ok(authService.login(request.phone(), request.code()), traceId(httpRequest));
	}

	@PostMapping("/campus-verification")
	ApiResponse<MeResponse> verifyCampusIdentity(@AuthenticationPrincipal AuthenticatedUser currentUser,
			@Valid @RequestBody CampusVerificationRequest request, HttpServletRequest httpRequest) {
		return ApiResponse.ok(authService.verifyCampusIdentity(currentUser.id(), request), traceId(httpRequest));
	}

	@GetMapping("/me")
	ApiResponse<MeResponse> me(@AuthenticationPrincipal AuthenticatedUser currentUser, HttpServletRequest httpRequest) {
		return ApiResponse.ok(authService.getMe(currentUser.id()), traceId(httpRequest));
	}

	private String traceId(HttpServletRequest request) {
		String traceId = request.getHeader("X-Trace-Id");
		if (traceId != null && !traceId.isBlank()) {
			return traceId;
		}
		return UUID.randomUUID().toString();
	}
}
