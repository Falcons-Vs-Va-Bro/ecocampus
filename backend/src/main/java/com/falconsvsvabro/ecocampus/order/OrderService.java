package com.falconsvsvabro.ecocampus.order;

import com.falconsvsvabro.ecocampus.auth.CampusAccessGuard;
import com.falconsvsvabro.ecocampus.common.api.BusinessException;
import com.falconsvsvabro.ecocampus.common.api.ErrorCode;
import com.falconsvsvabro.ecocampus.common.api.PageResponse;
import com.falconsvsvabro.ecocampus.item.AuditLog;
import com.falconsvsvabro.ecocampus.item.AuditLogRepository;
import com.falconsvsvabro.ecocampus.item.Item;
import com.falconsvsvabro.ecocampus.item.ItemRepository;
import com.falconsvsvabro.ecocampus.item.ItemStatus;
import com.falconsvsvabro.ecocampus.order.dto.CreateOrderRequest;
import com.falconsvsvabro.ecocampus.order.dto.OrderResponse;
import com.falconsvsvabro.ecocampus.order.dto.UpdateOrderStatusRequest;
import com.falconsvsvabro.ecocampus.user.User;
import com.falconsvsvabro.ecocampus.user.UserRepository;
import java.util.List;
import java.util.Set;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderService {

	private static final Set<OrderStatus> ACTIVE_STATUSES = Set.of(OrderStatus.PENDING_COMMUNICATION,
			OrderStatus.WAITING_PICKUP);

	private final OrderRepository orderRepository;
	private final ItemRepository itemRepository;
	private final AuditLogRepository auditLogRepository;
	private final CampusAccessGuard campusAccessGuard;
	private final UserRepository userRepository;

	public OrderService(OrderRepository orderRepository, ItemRepository itemRepository,
			AuditLogRepository auditLogRepository, CampusAccessGuard campusAccessGuard, UserRepository userRepository) {
		this.orderRepository = orderRepository;
		this.itemRepository = itemRepository;
		this.auditLogRepository = auditLogRepository;
		this.campusAccessGuard = campusAccessGuard;
		this.userRepository = userRepository;
	}

	@Transactional
	public OrderResponse createOrder(Long userId, CreateOrderRequest request) {
		User buyer = campusAccessGuard.requireVerifiedUser(userId);
		Item item = getItemForUpdate(request.itemId());
		campusAccessGuard.requireVerifiedUser(item.getSellerId());
		if (item.getStatus() != ItemStatus.ON_SALE) {
			throw new BusinessException(ErrorCode.CONFLICT, "item is not on sale");
		}
		if (item.getSellerId().equals(buyer.getId())) {
			throw new BusinessException(ErrorCode.CONFLICT, "cannot order own item");
		}
		if (!item.getDeliveryModes().contains(request.deliveryMode())) {
			throw new BusinessException(ErrorCode.BAD_REQUEST, "delivery mode not supported by item");
		}
		if (orderRepository.existsByItemIdAndStatusIn(item.getId(), ACTIVE_STATUSES)) {
			throw new BusinessException(ErrorCode.CONFLICT, "item already has an active order");
		}
		TradeOrder order = orderRepository.save(new TradeOrder(item.getId(), buyer.getId(), item.getSellerId(),
				request.deliveryMode(), request.remark()));
		writeAudit(buyer.getId(), order.getId(), "ORDER_CREATED", "order created");
		return toResponse(order);
	}

	@Transactional(readOnly = true)
	public PageResponse<OrderResponse> listOrders(Long userId, OrderRole role, OrderStatus status, int page, int size) {
		User user = campusAccessGuard.requireVerifiedUser(userId);
		Pageable pageable = PageRequest.of(normalizePage(page) - 1, normalizeSize(size));
		var orderPage = switch (role) {
			case BUYER -> orderRepository.findBuyerOrders(user.getId(), status, pageable);
			case SELLER -> orderRepository.findSellerOrders(user.getId(), status, pageable);
		};
		List<OrderResponse> items = orderPage.getContent().stream().map(this::toResponse).toList();
		return new PageResponse<>(items, normalizePage(page), normalizeSize(size), orderPage.getTotalElements());
	}

	@Transactional(readOnly = true)
	public OrderResponse getOrder(Long userId, Long orderId) {
		User user = campusAccessGuard.requireVerifiedUser(userId);
		TradeOrder order = getOrder(orderId);
		if (!order.involves(user.getId())) {
			throw new BusinessException(ErrorCode.FORBIDDEN, "order does not belong to current user");
		}
		return toResponse(order);
	}

	@Transactional
	public OrderResponse updateStatus(Long userId, Long orderId, UpdateOrderStatusRequest request) {
		User user = campusAccessGuard.requireVerifiedUser(userId);
		TradeOrder order = getOrderForUpdate(orderId);
		if (!order.involves(user.getId())) {
			throw new BusinessException(ErrorCode.FORBIDDEN, "order does not belong to current user");
		}
		ensureTransitionActor(user, order, request.targetStatus());
		try {
			order.transitionTo(request.targetStatus(), request.remark());
		}
		catch (IllegalStateException exception) {
			throw new BusinessException(ErrorCode.CONFLICT, exception.getMessage());
		}
		if (request.targetStatus() == OrderStatus.COMPLETED) {
			Item item = getItemForUpdate(order.getItemId());
			item.markSold();
		}
		writeAudit(user.getId(), order.getId(), "ORDER_STATUS_CHANGED", request.targetStatus().name());
		return toResponse(order);
	}

	private TradeOrder getOrder(Long orderId) {
		return orderRepository.findById(orderId)
			.orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "order not found"));
	}

	private TradeOrder getOrderForUpdate(Long orderId) {
		return orderRepository.findByIdForUpdate(orderId)
			.orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "order not found"));
	}

	private OrderResponse toResponse(TradeOrder order) {
		Item item = getItem(order.getItemId());
		User buyer = getUser(order.getBuyerId());
		User seller = getUser(order.getSellerId());
		return OrderResponse.from(order, item, buyer, seller);
	}

	private Item getItem(Long itemId) {
		return itemRepository.findById(itemId)
			.orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "item not found"));
	}

	private Item getItemForUpdate(Long itemId) {
		return itemRepository.findByIdForUpdate(itemId)
			.orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "item not found"));
	}

	private User getUser(Long userId) {
		return userRepository.findById(userId)
			.orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "user not found"));
	}

	private void ensureTransitionActor(User user, TradeOrder order, OrderStatus targetStatus) {
		if (targetStatus == OrderStatus.WAITING_PICKUP && !order.getSellerId().equals(user.getId())) {
			throw new BusinessException(ErrorCode.FORBIDDEN, "only seller can confirm pickup arrangement");
		}
		if (targetStatus == OrderStatus.COMPLETED && !order.getBuyerId().equals(user.getId())) {
			throw new BusinessException(ErrorCode.FORBIDDEN, "only buyer can confirm order completion");
		}
	}

	private int normalizePage(int page) {
		return Math.max(page, 1);
	}

	private int normalizeSize(int size) {
		if (size < 1) {
			return 20;
		}
		return Math.min(size, 100);
	}

	private void writeAudit(Long actorUserId, Long orderId, String action, String remark) {
		auditLogRepository.save(new AuditLog(actorUserId, "ORDER", orderId, action, remark));
	}
}
