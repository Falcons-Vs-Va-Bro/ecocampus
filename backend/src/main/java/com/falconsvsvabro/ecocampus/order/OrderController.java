package com.falconsvsvabro.ecocampus.order;

import com.falconsvsvabro.ecocampus.auth.AuthenticatedUser;
import com.falconsvsvabro.ecocampus.common.api.ApiResponse;
import com.falconsvsvabro.ecocampus.common.api.PageResponse;
import com.falconsvsvabro.ecocampus.order.dto.CreateOrderRequest;
import com.falconsvsvabro.ecocampus.order.dto.OrderResponse;
import com.falconsvsvabro.ecocampus.order.dto.UpdateOrderStatusRequest;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {

	private final OrderService orderService;

	public OrderController(OrderService orderService) {
		this.orderService = orderService;
	}

	@PostMapping
	ApiResponse<OrderResponse> createOrder(@AuthenticationPrincipal AuthenticatedUser currentUser,
			@Valid @RequestBody CreateOrderRequest requestBody, HttpServletRequest request) {
		return ApiResponse.ok(orderService.createOrder(currentUser.id(), requestBody), traceId(request));
	}

	@GetMapping
	ApiResponse<PageResponse<OrderResponse>> listOrders(@AuthenticationPrincipal AuthenticatedUser currentUser,
			@RequestParam(defaultValue = "BUYER") OrderRole role, @RequestParam(required = false) OrderStatus status,
			@RequestParam(defaultValue = "1") int page, @RequestParam(defaultValue = "20") int size,
			HttpServletRequest request) {
		return ApiResponse.ok(orderService.listOrders(currentUser.id(), role, status, page, size), traceId(request));
	}

	@GetMapping("/{orderId}")
	ApiResponse<OrderResponse> getOrder(@AuthenticationPrincipal AuthenticatedUser currentUser,
			@PathVariable Long orderId, HttpServletRequest request) {
		return ApiResponse.ok(orderService.getOrder(currentUser.id(), orderId), traceId(request));
	}

	@PostMapping("/{orderId}/status")
	ApiResponse<OrderResponse> updateStatus(@AuthenticationPrincipal AuthenticatedUser currentUser,
			@PathVariable Long orderId, @Valid @RequestBody UpdateOrderStatusRequest requestBody,
			HttpServletRequest request) {
		return ApiResponse.ok(orderService.updateStatus(currentUser.id(), orderId, requestBody), traceId(request));
	}

	private String traceId(HttpServletRequest request) {
		String traceId = request.getHeader("X-Trace-Id");
		if (traceId != null && !traceId.isBlank()) {
			return traceId;
		}
		return UUID.randomUUID().toString();
	}
}
