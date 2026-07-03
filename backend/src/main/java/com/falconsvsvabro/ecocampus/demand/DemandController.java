package com.falconsvsvabro.ecocampus.demand;

import com.falconsvsvabro.ecocampus.auth.AuthenticatedUser;
import com.falconsvsvabro.ecocampus.common.api.ApiResponse;
import com.falconsvsvabro.ecocampus.common.api.PageResponse;
import com.falconsvsvabro.ecocampus.demand.dto.DemandMatchResponse;
import com.falconsvsvabro.ecocampus.demand.dto.DemandRequest;
import com.falconsvsvabro.ecocampus.demand.dto.DemandResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/demands")
public class DemandController {

	private final DemandService demandService;

	public DemandController(DemandService demandService) {
		this.demandService = demandService;
	}

	@PostMapping
	ApiResponse<DemandResponse> createDemand(@AuthenticationPrincipal AuthenticatedUser currentUser,
			@Valid @RequestBody DemandRequest requestBody, HttpServletRequest request) {
		return ApiResponse.ok(demandService.createDemand(currentUser.id(), requestBody), traceId(request));
	}

	@GetMapping
	ApiResponse<PageResponse<DemandResponse>> searchDemands(@RequestParam(required = false) Long categoryId,
			@RequestParam(required = false) String keyword, @RequestParam(defaultValue = "1") int page,
			@RequestParam(defaultValue = "20") int size, HttpServletRequest request) {
		return ApiResponse.ok(demandService.searchDemands(categoryId, keyword, page, size), traceId(request));
	}

	@PostMapping("/{demandId}/close")
	ApiResponse<DemandResponse> closeDemand(@AuthenticationPrincipal AuthenticatedUser currentUser,
			@PathVariable Long demandId, HttpServletRequest request) {
		return ApiResponse.ok(demandService.closeDemand(currentUser.id(), demandId), traceId(request));
	}

	@GetMapping("/{demandId}/matches")
	ApiResponse<List<DemandMatchResponse>> matchDemand(@AuthenticationPrincipal AuthenticatedUser currentUser,
			@PathVariable Long demandId, HttpServletRequest request) {
		return ApiResponse.ok(demandService.matchDemand(currentUser.id(), demandId), traceId(request));
	}

	private String traceId(HttpServletRequest request) {
		String traceId = request.getHeader("X-Trace-Id");
		if (traceId != null && !traceId.isBlank()) {
			return traceId;
		}
		return UUID.randomUUID().toString();
	}
}
