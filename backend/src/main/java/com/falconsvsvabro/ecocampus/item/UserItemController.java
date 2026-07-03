package com.falconsvsvabro.ecocampus.item;

import com.falconsvsvabro.ecocampus.auth.AuthenticatedUser;
import com.falconsvsvabro.ecocampus.common.api.ApiResponse;
import com.falconsvsvabro.ecocampus.common.api.PageResponse;
import com.falconsvsvabro.ecocampus.item.dto.MyItemResponse;
import jakarta.servlet.http.HttpServletRequest;
import java.util.UUID;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users/me/items")
public class UserItemController {

	private final ItemService itemService;

	public UserItemController(ItemService itemService) {
		this.itemService = itemService;
	}

	@GetMapping
	ApiResponse<PageResponse<MyItemResponse>> listMyItems(@AuthenticationPrincipal AuthenticatedUser currentUser,
			@RequestParam(required = false) ItemStatus status, @RequestParam(defaultValue = "1") int page,
			@RequestParam(defaultValue = "20") int size, HttpServletRequest request) {
		return ApiResponse.ok(itemService.listMyItems(currentUser.id(), status, page, size), traceId(request));
	}

	private String traceId(HttpServletRequest request) {
		String traceId = request.getHeader("X-Trace-Id");
		if (traceId != null && !traceId.isBlank()) {
			return traceId;
		}
		return UUID.randomUUID().toString();
	}
}
