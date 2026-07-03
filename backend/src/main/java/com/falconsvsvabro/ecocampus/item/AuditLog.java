package com.falconsvsvabro.ecocampus.item;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;

@Entity
@Table(name = "audit_logs")
public class AuditLog {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private Long actorUserId;

	@Column(nullable = false, length = 40)
	private String targetType;

	@Column(nullable = false)
	private Long targetId;

	@Column(nullable = false, length = 80)
	private String action;

	@Column(length = 255)
	private String remark;

	@Column(nullable = false)
	private OffsetDateTime createdAt;

	protected AuditLog() {
	}

	public AuditLog(Long actorUserId, String targetType, Long targetId, String action, String remark) {
		this.actorUserId = actorUserId;
		this.targetType = targetType;
		this.targetId = targetId;
		this.action = action;
		this.remark = remark;
	}

	@PrePersist
	void prePersist() {
		this.createdAt = OffsetDateTime.now();
	}
}
