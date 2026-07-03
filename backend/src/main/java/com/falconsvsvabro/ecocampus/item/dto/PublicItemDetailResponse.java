package com.falconsvsvabro.ecocampus.item.dto;

import com.falconsvsvabro.ecocampus.item.DeliveryMode;
import com.falconsvsvabro.ecocampus.item.Item;
import com.falconsvsvabro.ecocampus.item.ItemStatus;
import com.falconsvsvabro.ecocampus.user.User;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Set;

public record PublicItemDetailResponse(Long id, String title, String description, Long categoryId, String categoryName,
		long priceCent, Set<DeliveryMode> deliveryModes, ItemStatus status, List<String> imageUrls, Seller seller,
		boolean favorited, long favoriteCount, OffsetDateTime createdAt) {

	public static PublicItemDetailResponse from(Item item, String categoryName, User seller, boolean favorited,
			long favoriteCount) {
		return new PublicItemDetailResponse(item.getId(), item.getTitle(), item.getDescription(), item.getCategoryId(),
				categoryName, item.getPriceCent(), item.getDeliveryModes(), item.getStatus(), item.getImageUrls(),
				new Seller(seller.getId(), seller.getNickname()), favorited, favoriteCount, item.getCreatedAt());
	}

	public record Seller(Long id, String nickname) {
	}
}
