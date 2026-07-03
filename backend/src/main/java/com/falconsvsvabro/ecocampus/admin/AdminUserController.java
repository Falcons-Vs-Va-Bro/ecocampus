package com.falconsvsvabro.ecocampus.admin;

import com.falconsvsvabro.ecocampus.admin.dto.AdminUserResponse;
import com.falconsvsvabro.ecocampus.admin.dto.BlacklistUserRequest;
import com.falconsvsvabro.ecocampus.auth.AuthenticatedUser;
import com.falconsvsvabro.ecocampus.common.api.ApiResponse;
import com.falconsvsvabro.ecocampus.common.api.PageResponse;
import com.falconsvsvabro.ecocampus.user.VerificationStatus;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/users")
public class AdminUserController {

	private final AdminUserService adminUserService;

	public AdminUserController(AdminUserService adminUserService) {
		this.adminUserService = adminUserService;
	}

	@GetMapping
	ApiResponse<PageResponse<AdminUserResponse>> listUsers(@AuthenticationPrincipal AuthenticatedUser currentUser,
			@RequestParam(required = false) String keyword,
			@RequestParam(required = false) VerificationStatus verificationStatus,
			@RequestParam(defaultValue = "1") int page, @RequestParam(defaultValue = "20") int size,
			HttpServletRequest request) {
		return ApiResponse.ok(adminUserService.listUsers(currentUser.id(), keyword, verificationStatus, page, size),
				traceId(request));
	}

	@PostMapping("/{userId}/blacklist")
	ApiResponse<AdminUserResponse> blacklist(@AuthenticationPrincipal AuthenticatedUser currentUser,
			@PathVariable Long userId, @Valid @RequestBody BlacklistUserRequest requestBody,
			HttpServletRequest request) {
		return ApiResponse.ok(adminUserService.blacklist(currentUser.id(), userId, requestBody), traceId(request));
	}

	@DeleteMapping("/{userId}/blacklist")
	ApiResponse<Void> removeBlacklist(@AuthenticationPrincipal AuthenticatedUser currentUser, @PathVariable Long userId,
			HttpServletRequest request) {
		adminUserService.removeBlacklist(currentUser.id(), userId);
		return ApiResponse.ok(null, traceId(request));
	}

	private String traceId(HttpServletRequest request) {
		String traceId = request.getHeader("X-Trace-Id");
		if (traceId != null && !traceId.isBlank()) {
			return traceId;
		}
		return UUID.randomUUID().toString();
	}
}
