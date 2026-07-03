package com.falconsvsvabro.ecocampus.item.dto;

import com.falconsvsvabro.ecocampus.item.Item;
import com.falconsvsvabro.ecocampus.item.ItemStatus;
import java.time.OffsetDateTime;

public record MyItemResponse(Long id, String title, String categoryName, long priceCent, ItemStatus status,
		String coverImageUrl, OffsetDateTime createdAt) {

	public static MyItemResponse from(Item item, String categoryName) {
		String coverImageUrl = item.getImageUrls().isEmpty() ? null : item.getImageUrls().getFirst();
		return new MyItemResponse(item.getId(), item.getTitle(), categoryName, item.getPriceCent(), item.getStatus(),
				coverImageUrl, item.getCreatedAt());
	}
}
