package com.falconsvsvabro.ecocampus.conversation;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;

@Entity
@Table(name = "conversation_messages")
public class ConversationMessage {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private Long conversationId;

	@Column(nullable = false)
	private Long senderId;

	@Column(nullable = false, length = 1000)
	private String content;

	@Column(nullable = false)
	private OffsetDateTime createdAt;

	protected ConversationMessage() {
	}

	public ConversationMessage(Long conversationId, Long senderId, String content) {
		this.conversationId = conversationId;
		this.senderId = senderId;
		this.content = content;
	}

	@PrePersist
	void prePersist() {
		this.createdAt = OffsetDateTime.now();
	}

	public Long getId() {
		return id;
	}

	public Long getConversationId() {
		return conversationId;
	}

	public Long getSenderId() {
		return senderId;
	}

	public String getContent() {
		return content;
	}

	public OffsetDateTime getCreatedAt() {
		return createdAt;
	}
}
