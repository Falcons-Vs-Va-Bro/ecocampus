package com.falconsvsvabro.ecocampus.item;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "items")
public class Item {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private Long sellerId;

	@Column(nullable = false, length = 80)
	private String title;

	@Column(nullable = false, length = 2000)
	private String description;

	@Column(nullable = false)
	private Long categoryId;

	@Column(nullable = false)
	private long priceCent;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 30)
	private ItemStatus status;

	// 乐观锁版本号：防止卖家编辑、管理员审核和订单完成等并发修改互相覆盖。
	@Version
	@Column(nullable = false)
	private long version;

	@ElementCollection(fetch = FetchType.EAGER)
	@CollectionTable(name = "item_delivery_modes", joinColumns = @JoinColumn(name = "item_id"))
	@Enumerated(EnumType.STRING)
	@Column(name = "delivery_mode", nullable = false, length = 40)
	private Set<DeliveryMode> deliveryModes = new LinkedHashSet<>();

	@ElementCollection(fetch = FetchType.EAGER)
	@CollectionTable(name = "item_images", joinColumns = @JoinColumn(name = "item_id"))
	@OrderColumn(name = "sort_order")
	@Column(name = "image_url", nullable = false, length = 500)
	private List<String> imageUrls = new ArrayList<>();

	@Column(nullable = false)
	private OffsetDateTime createdAt;

	@Column(nullable = false)
	private OffsetDateTime updatedAt;

	protected Item() {
	}

	public Item(Long sellerId, String title, String description, Long categoryId, long priceCent,
			Set<DeliveryMode> deliveryModes, List<String> imageUrls) {
		this.sellerId = sellerId;
		this.title = title;
		this.description = description;
		this.categoryId = categoryId;
		this.priceCent = priceCent;
		this.deliveryModes = new LinkedHashSet<>(deliveryModes);
		this.imageUrls = new ArrayList<>(imageUrls);
		this.status = ItemStatus.PENDING_REVIEW;
	}

	public void updateContent(String title, String description, Long categoryId, long priceCent,
			Set<DeliveryMode> deliveryModes, List<String> imageUrls) {
		this.title = title;
		this.description = description;
		this.categoryId = categoryId;
		this.priceCent = priceCent;
		this.deliveryModes.clear();
		this.deliveryModes.addAll(deliveryModes);
		this.imageUrls.clear();
		this.imageUrls.addAll(imageUrls);
		if (status == ItemStatus.ON_SALE || status == ItemStatus.REJECTED || status == ItemStatus.OFF_SHELF) {
			this.status = ItemStatus.PENDING_REVIEW;
		}
	}

	public void requestOnSaleReview() {
		if (status == ItemStatus.VIOLATION_REMOVED || status == ItemStatus.SOLD || status == ItemStatus.DELETED) {
			throw new IllegalStateException("item cannot be put on sale");
		}
		this.status = ItemStatus.PENDING_REVIEW;
	}

	public void offShelf() {
		if (status == ItemStatus.SOLD || status == ItemStatus.DELETED) {
			throw new IllegalStateException("item cannot be off-shelved");
		}
		this.status = ItemStatus.OFF_SHELF;
	}

	public void review(boolean approved) {
		if (status != ItemStatus.PENDING_REVIEW) {
			throw new IllegalStateException("item is not pending review");
		}
		this.status = approved ? ItemStatus.ON_SALE : ItemStatus.REJECTED;
	}

	public void violationRemove() {
		if (status == ItemStatus.DELETED) {
			throw new IllegalStateException("deleted item cannot be removed");
		}
		this.status = ItemStatus.VIOLATION_REMOVED;
	}

	public void markSold() {
		if (status != ItemStatus.ON_SALE) {
			throw new IllegalStateException("item is not on sale");
		}
		this.status = ItemStatus.SOLD;
	}

	public boolean isEditableBySeller() {
		return status != ItemStatus.VIOLATION_REMOVED && status != ItemStatus.SOLD && status != ItemStatus.DELETED;
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

	public Long getSellerId() {
		return sellerId;
	}

	public String getTitle() {
		return title;
	}

	public String getDescription() {
		return description;
	}

	public Long getCategoryId() {
		return categoryId;
	}

	public long getPriceCent() {
		return priceCent;
	}

	public ItemStatus getStatus() {
		return status;
	}

	public Set<DeliveryMode> getDeliveryModes() {
		return Set.copyOf(deliveryModes);
	}

	public List<String> getImageUrls() {
		return List.copyOf(imageUrls);
	}

	public OffsetDateTime getCreatedAt() {
		return createdAt;
	}

	public OffsetDateTime getUpdatedAt() {
		return updatedAt;
	}
}
