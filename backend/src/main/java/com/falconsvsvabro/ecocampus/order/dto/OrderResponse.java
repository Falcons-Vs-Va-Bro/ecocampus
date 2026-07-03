package com.falconsvsvabro.ecocampus.order.dto;

import com.falconsvsvabro.ecocampus.item.DeliveryMode;
import com.falconsvsvabro.ecocampus.order.OrderStatus;
import com.falconsvsvabro.ecocampus.order.TradeOrder;
import java.time.OffsetDateTime;

public record OrderResponse(Long id, Long itemId, String itemTitle, Long buyerId, Long sellerId,
		DeliveryMode deliveryMode, OrderStatus status, String remark, OffsetDateTime createdAt) {

	public static OrderResponse from(TradeOrder order, String itemTitle) {
		return new OrderResponse(order.getId(), order.getItemId(), itemTitle, order.getBuyerId(), order.getSellerId(),
				order.getDeliveryMode(), order.getStatus(), order.getRemark(), order.getCreatedAt());
	}
}
