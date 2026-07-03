package com.falconsvsvabro.ecocampus.order;

import com.falconsvsvabro.ecocampus.item.DeliveryMode;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;

@Entity
@Table(name = "trade_orders")
public class TradeOrder {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private Long itemId;

	@Column(nullable = false)
	private Long buyerId;

	@Column(nullable = false)
	private Long sellerId;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 40)
	private DeliveryMode deliveryMode;

	@Column(length = 255)
	private String remark;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 40)
	private OrderStatus status;

	@Column(nullable = false)
	private OffsetDateTime createdAt;

	@Column(nullable = false)
	private OffsetDateTime updatedAt;

	protected TradeOrder() {
	}

	public TradeOrder(Long itemId, Long buyerId, Long sellerId, DeliveryMode deliveryMode, String remark) {
		this.itemId = itemId;
		this.buyerId = buyerId;
		this.sellerId = sellerId;
		this.deliveryMode = deliveryMode;
		this.remark = remark;
		this.status = OrderStatus.PENDING_COMMUNICATION;
	}

	public void transitionTo(OrderStatus targetStatus, String remark) {
		if (!canTransitionTo(targetStatus)) {
			throw new IllegalStateException("invalid order status transition");
		}
		this.status = targetStatus;
		if (remark != null && !remark.isBlank()) {
			this.remark = remark;
		}
	}

	public boolean involves(Long userId) {
		return buyerId.equals(userId) || sellerId.equals(userId);
	}

	private boolean canTransitionTo(OrderStatus targetStatus) {
		return switch (status) {
			case PENDING_COMMUNICATION -> targetStatus == OrderStatus.WAITING_PICKUP
					|| targetStatus == OrderStatus.CANCELLED;
			case WAITING_PICKUP -> targetStatus == OrderStatus.COMPLETED || targetStatus == OrderStatus.CANCELLED;
			case COMPLETED, CANCELLED -> false;
		};
	}

	@PrePersist
	void prePersist() {
		OffsetDateTime now = OffsetDateTime.now();
		this.createdAt = now;
		this.updatedAt = now;
	}

	@PreUpdate
	void preUpdate() {
		this.updatedAt = OffsetDateTime.now();
	}

	public Long getId() {
		return id;
	}

	public Long getItemId() {
		return itemId;
	}

	public Long getBuyerId() {
		return buyerId;
	}

	public Long getSellerId() {
		return sellerId;
	}

	public DeliveryMode getDeliveryMode() {
		return deliveryMode;
	}

	public String getRemark() {
		return remark;
	}

	public OrderStatus getStatus() {
		return status;
	}

	public OffsetDateTime getCreatedAt() {
		return createdAt;
	}
}
