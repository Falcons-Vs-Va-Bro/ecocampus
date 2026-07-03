package com.falconsvsvabro.ecocampus.demand;

import com.falconsvsvabro.ecocampus.auth.AuthenticatedUser;
import com.falconsvsvabro.ecocampus.common.api.ApiResponse;
import com.falconsvsvabro.ecocampus.common.api.PageResponse;
import com.falconsvsvabro.ecocampus.demand.dto.DemandResponse;
import jakarta.servlet.http.HttpServletRequest;
import java.util.UUID;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users/me/demands")
public class UserDemandController {

	private final DemandService demandService;

	public UserDemandController(DemandService demandService) {
		this.demandService = demandService;
	}

	@GetMapping
	ApiResponse<PageResponse<DemandResponse>> listMyDemands(@AuthenticationPrincipal AuthenticatedUser currentUser,
			@RequestParam(defaultValue = "1") int page, @RequestParam(defaultValue = "20") int size,
			HttpServletRequest request) {
		return ApiResponse.ok(demandService.listMyDemands(currentUser.id(), page, size), traceId(request));
	}

	private String traceId(HttpServletRequest request) {
		String traceId = request.getHeader("X-Trace-Id");
		if (traceId != null && !traceId.isBlank()) {
			return traceId;
		}
		return UUID.randomUUID().toString();
	}
}
