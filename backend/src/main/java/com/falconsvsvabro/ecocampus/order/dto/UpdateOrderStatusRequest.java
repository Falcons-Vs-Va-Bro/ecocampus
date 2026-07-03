package com.falconsvsvabro.ecocampus.order.dto;

import com.falconsvsvabro.ecocampus.order.OrderStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateOrderStatusRequest(
		@NotNull OrderStatus targetStatus,
		@Size(max = 255) String remark) {
}
