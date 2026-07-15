package com.falconsvsvabro.ecocampus.item.dto;

import com.falconsvsvabro.ecocampus.item.Item;
import com.falconsvsvabro.ecocampus.item.ItemStatus;
import com.falconsvsvabro.ecocampus.item.DeliveryMode;
import com.falconsvsvabro.ecocampus.user.User;
import java.time.OffsetDateTime;
import java.util.Set;

public record PublicItemListResponse(Long id, String title, String categoryName, long priceCent, ItemStatus status,
		String coverImageUrl, OffsetDateTime createdAt, Set<DeliveryMode> deliveryModes, Seller seller,
		boolean favorited, long favoriteCount) {

	public static PublicItemListResponse from(Item item, String categoryName, User seller, boolean favorited,
			long favoriteCount) {
		String coverImageUrl = item.getImageUrls().isEmpty() ? null : item.getImageUrls().getFirst();
		return new PublicItemListResponse(item.getId(), item.getTitle(), categoryName, item.getPriceCent(),
				item.getStatus(), coverImageUrl, item.getCreatedAt(), item.getDeliveryModes(),
				new Seller(seller.getId(), seller.getNickname(), seller.getVerificationStatus()), favorited,
				favoriteCount);
	}

	public record Seller(Long id, String nickname,
			com.falconsvsvabro.ecocampus.user.VerificationStatus verificationStatus) {
	}
}
