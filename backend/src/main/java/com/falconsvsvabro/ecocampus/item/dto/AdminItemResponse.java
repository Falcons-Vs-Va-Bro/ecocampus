package com.falconsvsvabro.ecocampus.item.dto;

import com.falconsvsvabro.ecocampus.item.Item;
import com.falconsvsvabro.ecocampus.item.ItemStatus;
import com.falconsvsvabro.ecocampus.user.User;
import java.time.OffsetDateTime;

public record AdminItemResponse(Long id, String title, Long sellerId, String sellerNickname, String categoryName,
		long priceCent, ItemStatus status, OffsetDateTime createdAt) {

	public static AdminItemResponse from(Item item, User seller, String categoryName) {
		return new AdminItemResponse(item.getId(), item.getTitle(), seller.getId(), seller.getNickname(), categoryName,
				item.getPriceCent(), item.getStatus(), item.getCreatedAt());
	}
}
