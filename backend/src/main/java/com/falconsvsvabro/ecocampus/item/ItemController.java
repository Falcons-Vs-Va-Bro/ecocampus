package com.falconsvsvabro.ecocampus.item;

import com.falconsvsvabro.ecocampus.auth.AuthenticatedUser;
import com.falconsvsvabro.ecocampus.common.api.ApiResponse;
import com.falconsvsvabro.ecocampus.common.api.PageResponse;
import com.falconsvsvabro.ecocampus.favorite.FavoriteService;
import com.falconsvsvabro.ecocampus.item.dto.PublicItemDetailResponse;
import com.falconsvsvabro.ecocampus.item.dto.PublicItemListResponse;
import com.falconsvsvabro.ecocampus.item.dto.ItemDetailResponse;
import com.falconsvsvabro.ecocampus.item.dto.ItemRequest;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/items")
public class ItemController {

	private final ItemService itemService;
	private final FavoriteService favoriteService;

	public ItemController(ItemService itemService, FavoriteService favoriteService) {
		this.itemService = itemService;
		this.favoriteService = favoriteService;
	}

	@GetMapping
	ApiResponse<PageResponse<PublicItemListResponse>> listItems(@RequestParam(required = false) String keyword,
			@RequestParam(required = false) Long categoryId, @RequestParam(required = false) Long minPriceCent,
			@RequestParam(required = false) Long maxPriceCent, @RequestParam(required = false) DeliveryMode deliveryMode,
			@RequestParam(defaultValue = "1") int page, @RequestParam(defaultValue = "20") int size,
			HttpServletRequest request) {
		return ApiResponse.ok(itemService.searchPublicItems(keyword, categoryId, minPriceCent, maxPriceCent,
				deliveryMode, page, size), traceId(request));
	}

	@GetMapping("/{itemId}")
	ApiResponse<PublicItemDetailResponse> getItem(@AuthenticationPrincipal AuthenticatedUser currentUser,
			@PathVariable Long itemId, HttpServletRequest request) {
		Long viewerUserId = currentUser == null ? null : currentUser.id();
		return ApiResponse.ok(itemService.getPublicItemDetail(itemId, viewerUserId), traceId(request));
	}

	@PostMapping
	ApiResponse<ItemDetailResponse> createItem(@AuthenticationPrincipal AuthenticatedUser currentUser,
			@Valid @RequestBody ItemRequest requestBody, HttpServletRequest request) {
		return ApiResponse.ok(itemService.createItem(currentUser.id(), requestBody), traceId(request));
	}

	@PutMapping("/{itemId}")
	ApiResponse<ItemDetailResponse> updateItem(@AuthenticationPrincipal AuthenticatedUser currentUser,
			@PathVariable Long itemId, @Valid @RequestBody ItemRequest requestBody, HttpServletRequest request) {
		return ApiResponse.ok(itemService.updateItem(currentUser.id(), itemId, requestBody), traceId(request));
	}

	@PostMapping("/{itemId}/on-sale")
	ApiResponse<ItemDetailResponse> requestOnSale(@AuthenticationPrincipal AuthenticatedUser currentUser,
			@PathVariable Long itemId, HttpServletRequest request) {
		return ApiResponse.ok(itemService.requestOnSale(currentUser.id(), itemId), traceId(request));
	}

	@PostMapping("/{itemId}/off-shelf")
	ApiResponse<ItemDetailResponse> offShelf(@AuthenticationPrincipal AuthenticatedUser currentUser,
			@PathVariable Long itemId, HttpServletRequest request) {
		return ApiResponse.ok(itemService.offShelf(currentUser.id(), itemId), traceId(request));
	}

	@PostMapping("/{itemId}/favorite")
	ApiResponse<PublicItemDetailResponse> favorite(@AuthenticationPrincipal AuthenticatedUser currentUser,
			@PathVariable Long itemId, HttpServletRequest request) {
		return ApiResponse.ok(favoriteService.favorite(currentUser.id(), itemId), traceId(request));
	}

	@DeleteMapping("/{itemId}/favorite")
	ApiResponse<Void> unfavorite(@AuthenticationPrincipal AuthenticatedUser currentUser, @PathVariable Long itemId,
			HttpServletRequest request) {
		favoriteService.unfavorite(currentUser.id(), itemId);
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
