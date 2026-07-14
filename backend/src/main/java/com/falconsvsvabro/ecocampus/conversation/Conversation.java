package com.falconsvsvabro.ecocampus.conversation;

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
@Table(name = "conversations")
public class Conversation {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private Long itemId;

	@Column(nullable = false)
	private Long userOneId;

	@Column(nullable = false)
	private Long userTwoId;

	@Column(length = 200)
	private String lastMessage;

	private OffsetDateTime lastMessageAt;

	private OffsetDateTime userOneReadAt;

	private OffsetDateTime userTwoReadAt;

	@Column(nullable = false)
	private OffsetDateTime createdAt;

	@Column(nullable = false)
	private OffsetDateTime updatedAt;

	protected Conversation() {
	}

	public Conversation(Long itemId, Long userOneId, Long userTwoId) {
		this.itemId = itemId;
		this.userOneId = Math.min(userOneId, userTwoId);
		this.userTwoId = Math.max(userOneId, userTwoId);
	}

	public boolean involves(Long userId) {
		return userOneId.equals(userId) || userTwoId.equals(userId);
	}

	public Long otherUserId(Long currentUserId) {
		return userOneId.equals(currentUserId) ? userTwoId : userOneId;
	}

	public void updateLastMessage(String content) {
		this.lastMessage = content.length() > 200 ? content.substring(0, 200) : content;
		this.lastMessageAt = OffsetDateTime.now();
	}

	public void markRead(Long userId) {
		if (userOneId.equals(userId)) {
			this.userOneReadAt = OffsetDateTime.now();
		}
		else if (userTwoId.equals(userId)) {
			this.userTwoReadAt = OffsetDateTime.now();
		}
	}

	public OffsetDateTime readAt(Long userId) {
		return userOneId.equals(userId) ? userOneReadAt : userTwoReadAt;
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

	public Long getUserOneId() {
		return userOneId;
	}

	public Long getUserTwoId() {
		return userTwoId;
	}

	public String getLastMessage() {
		return lastMessage;
	}

	public OffsetDateTime getLastMessageAt() {
		return lastMessageAt;
	}

	public OffsetDateTime getCreatedAt() {
		return createdAt;
	}
}
