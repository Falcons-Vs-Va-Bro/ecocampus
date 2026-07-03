package com.falconsvsvabro.ecocampus.conversation.dto;

import com.falconsvsvabro.ecocampus.conversation.ConversationMessage;
import java.time.OffsetDateTime;

public record MessageResponse(Long id, Long conversationId, Long senderId, String content, OffsetDateTime createdAt) {

	public static MessageResponse from(ConversationMessage message) {
		return new MessageResponse(message.getId(), message.getConversationId(), message.getSenderId(),
				message.getContent(), message.getCreatedAt());
	}
}
