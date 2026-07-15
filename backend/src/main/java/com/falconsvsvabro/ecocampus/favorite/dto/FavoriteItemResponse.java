package com.falconsvsvabro.ecocampus.favorite.dto;

import com.falconsvsvabro.ecocampus.item.DeliveryMode;
import com.falconsvsvabro.ecocampus.item.Item;
import com.falconsvsvabro.ecocampus.item.ItemStatus;
import com.falconsvsvabro.ecocampus.user.User;
import com.falconsvsvabro.ecocampus.user.VerificationStatus;
import java.time.OffsetDateTime;
import java.util.Set;

public record FavoriteItemResponse(Long id, String title, String categoryName, long priceCent, ItemStatus status,
		String coverImageUrl, OffsetDateTime createdAt, Set<DeliveryMode> deliveryModes, Seller seller,
		boolean favorited, long favoriteCount, OffsetDateTime favoritedAt, String invalidReason) {

	public static FavoriteItemResponse from(Item item, String categoryName, User seller, long favoriteCount,
			OffsetDateTime favoritedAt) {
		String coverImageUrl = item.getImageUrls().isEmpty() ? null : item.getImageUrls().getFirst();
		return new FavoriteItemResponse(item.getId(), item.getTitle(), categoryName, item.getPriceCent(),
				item.getStatus(), coverImageUrl, item.getCreatedAt(), item.getDeliveryModes(),
				new Seller(seller.getId(), seller.getNickname(), seller.getVerificationStatus()), true, favoriteCount,
				favoritedAt, invalidReason(item.getStatus()));
	}

	private static String invalidReason(ItemStatus status) {
		return switch (status) {
			case ON_SALE -> null;
			case OFF_SHELF -> "商品已下架";
			case SOLD -> "商品已售出";
			case REJECTED -> "商品审核未通过";
			case VIOLATION_REMOVED -> "商品因违规被下架";
			case PENDING_REVIEW -> "商品正在审核中";
			case DRAFT -> "商品仍是草稿";
			case DELETED -> "商品已删除";
		};
	}

	public record Seller(Long id, String nickname, VerificationStatus verificationStatus) {
	}
}
