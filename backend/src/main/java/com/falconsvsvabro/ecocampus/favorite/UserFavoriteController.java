package com.falconsvsvabro.ecocampus.favorite;

import com.falconsvsvabro.ecocampus.auth.AuthenticatedUser;
import com.falconsvsvabro.ecocampus.common.api.ApiResponse;
import com.falconsvsvabro.ecocampus.common.api.PageResponse;
import com.falconsvsvabro.ecocampus.favorite.dto.FavoriteItemResponse;
import jakarta.servlet.http.HttpServletRequest;
import java.util.UUID;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users/me/favorites")
public class UserFavoriteController {

	private final FavoriteService favoriteService;

	public UserFavoriteController(FavoriteService favoriteService) {
		this.favoriteService = favoriteService;
	}

	@GetMapping
	ApiResponse<PageResponse<FavoriteItemResponse>> listMyFavorites(
			@AuthenticationPrincipal AuthenticatedUser currentUser, @RequestParam(defaultValue = "1") int page,
			@RequestParam(defaultValue = "20") int size, HttpServletRequest request) {
		return ApiResponse.ok(favoriteService.listMyFavorites(currentUser.id(), page, size), traceId(request));
	}

	private String traceId(HttpServletRequest request) {
		String traceId = request.getHeader("X-Trace-Id");
		if (traceId != null && !traceId.isBlank()) {
			return traceId;
		}
		return UUID.randomUUID().toString();
	}
}
