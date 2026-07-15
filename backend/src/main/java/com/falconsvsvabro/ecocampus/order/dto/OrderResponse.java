package com.falconsvsvabro.ecocampus.order.dto;

import com.falconsvsvabro.ecocampus.item.DeliveryMode;
import com.falconsvsvabro.ecocampus.item.Item;
import com.falconsvsvabro.ecocampus.order.OrderStatus;
import com.falconsvsvabro.ecocampus.order.TradeOrder;
import com.falconsvsvabro.ecocampus.user.User;
import java.time.OffsetDateTime;

public record OrderResponse(Long id, Long itemId, String itemTitle, Long buyerId, Long sellerId,
		DeliveryMode deliveryMode, OrderStatus status, String remark, OffsetDateTime createdAt, String itemCoverImageUrl,
		long itemPriceCent, String buyerNickname, String sellerNickname) {

	public static OrderResponse from(TradeOrder order, Item item, User buyer, User seller) {
		String coverImageUrl = item.getImageUrls().isEmpty() ? null : item.getImageUrls().getFirst();
		return new OrderResponse(order.getId(), order.getItemId(), item.getTitle(), order.getBuyerId(),
				order.getSellerId(), order.getDeliveryMode(), order.getStatus(), order.getRemark(),
				order.getCreatedAt(), coverImageUrl, item.getPriceCent(), buyer.getNickname(), seller.getNickname());
	}
}
