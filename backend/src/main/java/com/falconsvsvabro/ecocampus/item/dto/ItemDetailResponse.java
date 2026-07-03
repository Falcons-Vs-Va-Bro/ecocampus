package com.falconsvsvabro.ecocampus.item.dto;

import com.falconsvsvabro.ecocampus.item.DeliveryMode;
import com.falconsvsvabro.ecocampus.item.Item;
import com.falconsvsvabro.ecocampus.item.ItemStatus;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Set;

public record ItemDetailResponse(Long id, String title, String description, Long categoryId, String categoryName,
		long priceCent, Set<DeliveryMode> deliveryModes, ItemStatus status, List<String> imageUrls,
		OffsetDateTime createdAt) {

	public static ItemDetailResponse from(Item item, String categoryName) {
		return new ItemDetailResponse(item.getId(), item.getTitle(), item.getDescription(), item.getCategoryId(),
				categoryName, item.getPriceCent(), item.getDeliveryModes(), item.getStatus(), item.getImageUrls(),
				item.getCreatedAt());
	}
}
