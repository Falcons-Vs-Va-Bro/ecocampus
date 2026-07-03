package com.falconsvsvabro.ecocampus.admin;

import com.falconsvsvabro.ecocampus.admin.dto.DashboardOverviewResponse;
import com.falconsvsvabro.ecocampus.auth.AuthenticatedUser;
import com.falconsvsvabro.ecocampus.common.api.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import java.util.UUID;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/dashboard")
public class AdminDashboardController {

	private final AdminDashboardService adminDashboardService;

	public AdminDashboardController(AdminDashboardService adminDashboardService) {
		this.adminDashboardService = adminDashboardService;
	}

	@GetMapping("/overview")
	ApiResponse<DashboardOverviewResponse> overview(@AuthenticationPrincipal AuthenticatedUser currentUser,
			HttpServletRequest request) {
		return ApiResponse.ok(adminDashboardService.overview(currentUser.id()), traceId(request));
	}

	private String traceId(HttpServletRequest request) {
		String traceId = request.getHeader("X-Trace-Id");
		if (traceId != null && !traceId.isBlank()) {
			return traceId;
		}
		return UUID.randomUUID().toString();
	}
}
