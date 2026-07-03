package com.falconsvsvabro.ecocampus.order.dto;

import com.falconsvsvabro.ecocampus.item.DeliveryMode;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateOrderRequest(
		@NotNull Long itemId,
		@NotNull DeliveryMode deliveryMode,
		@Size(max = 255) String remark) {
}
