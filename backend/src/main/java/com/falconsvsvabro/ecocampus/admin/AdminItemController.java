package com.falconsvsvabro.ecocampus.admin;

import com.falconsvsvabro.ecocampus.auth.AuthenticatedUser;
import com.falconsvsvabro.ecocampus.common.api.ApiResponse;
import com.falconsvsvabro.ecocampus.common.api.PageResponse;
import com.falconsvsvabro.ecocampus.item.ItemService;
import com.falconsvsvabro.ecocampus.item.ItemStatus;
import com.falconsvsvabro.ecocampus.item.dto.AdminItemResponse;
import com.falconsvsvabro.ecocampus.item.dto.AdminItemReviewRequest;
import com.falconsvsvabro.ecocampus.item.dto.AdminViolationRemoveRequest;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
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
@RequestMapping("/api/v1/admin/items")
public class AdminItemController {

	private final ItemService itemService;

	public AdminItemController(ItemService itemService) {
		this.itemService = itemService;
	}

	@GetMapping("/review")
	ApiResponse<PageResponse<AdminItemResponse>> listReviewItems(@AuthenticationPrincipal AuthenticatedUser currentUser,
			@RequestParam(defaultValue = "PENDING_REVIEW") ItemStatus status, @RequestParam(defaultValue = "1") int page,
			@RequestParam(defaultValue = "20") int size, HttpServletRequest request) {
		return ApiResponse.ok(itemService.listAdminReviewItems(currentUser.id(), status, page, size), traceId(request));
	}

	@PostMapping("/{itemId}/review")
	ApiResponse<AdminItemResponse> reviewItem(@AuthenticationPrincipal AuthenticatedUser currentUser,
			@PathVariable Long itemId, @Valid @RequestBody AdminItemReviewRequest requestBody,
			HttpServletRequest request) {
		return ApiResponse.ok(itemService.reviewItem(currentUser.id(), itemId, requestBody), traceId(request));
	}

	@GetMapping
	ApiResponse<PageResponse<AdminItemResponse>> listAdminItems(@AuthenticationPrincipal AuthenticatedUser currentUser,
			@RequestParam(required = false) ItemStatus status, @RequestParam(required = false) String keyword,
			@RequestParam(required = false) Long categoryId, @RequestParam(defaultValue = "1") int page,
			@RequestParam(defaultValue = "20") int size, HttpServletRequest request) {
		return ApiResponse.ok(itemService.listAdminItems(currentUser.id(), status, keyword, categoryId, page, size),
				traceId(request));
	}

	@PostMapping("/{itemId}/violation-remove")
	ApiResponse<AdminItemResponse> violationRemove(@AuthenticationPrincipal AuthenticatedUser currentUser,
			@PathVariable Long itemId, @Valid @RequestBody AdminViolationRemoveRequest requestBody,
			HttpServletRequest request) {
		return ApiResponse.ok(itemService.violationRemove(currentUser.id(), itemId, requestBody.reason()),
				traceId(request));
	}

	private String traceId(HttpServletRequest request) {
		String traceId = request.getHeader("X-Trace-Id");
		if (traceId != null && !traceId.isBlank()) {
			return traceId;
		}
		return UUID.randomUUID().toString();
	}
}
