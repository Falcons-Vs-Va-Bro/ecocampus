package com.falconsvsvabro.ecocampus.user;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;

@Entity
@Table(name = "user_addresses")
public class Address {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private Long userId;

	@Column(nullable = false, length = 40)
	private String receiverName;

	@Column(nullable = false, length = 20)
	private String receiverPhone;

	@Column(nullable = false, length = 80)
	private String campusArea;

	@Column(nullable = false, length = 255)
	private String detail;

	@Column(nullable = false)
	private boolean defaultAddress;

	@Column
	private Long defaultOwnerId;

	@Column(nullable = false)
	private OffsetDateTime createdAt;

	@Column(nullable = false)
	private OffsetDateTime updatedAt;

	protected Address() {
	}

	public Address(Long userId, String receiverName, String receiverPhone, String campusArea, String detail,
			boolean defaultAddress) {
		this.userId = userId;
		this.receiverName = receiverName;
		this.receiverPhone = receiverPhone;
		this.campusArea = campusArea;
		this.detail = detail;
		setDefaultAddress(defaultAddress);
	}

	public void update(String receiverName, String receiverPhone, String campusArea, String detail,
			boolean defaultAddress) {
		this.receiverName = receiverName;
		this.receiverPhone = receiverPhone;
		this.campusArea = campusArea;
		this.detail = detail;
		setDefaultAddress(defaultAddress);
	}

	public void setDefaultAddress(boolean defaultAddress) {
		this.defaultAddress = defaultAddress;
		// 默认地址唯一约束使用该辅助列：默认时写 userId，非默认时写 null。
		this.defaultOwnerId = defaultAddress ? userId : null;
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

	public Long getUserId() {
		return userId;
	}

	public String getReceiverName() {
		return receiverName;
	}

	public String getReceiverPhone() {
		return receiverPhone;
	}

	public String getCampusArea() {
		return campusArea;
	}

	public String getDetail() {
		return detail;
	}

	public boolean isDefaultAddress() {
		return defaultAddress;
	}

	public Long getDefaultOwnerId() {
		return defaultOwnerId;
	}

	public OffsetDateTime getCreatedAt() {
		return createdAt;
	}

	public OffsetDateTime getUpdatedAt() {
		return updatedAt;
	}
}
