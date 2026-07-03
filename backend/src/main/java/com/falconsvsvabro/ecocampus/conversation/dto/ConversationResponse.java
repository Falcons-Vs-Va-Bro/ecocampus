package com.falconsvsvabro.ecocampus.conversation.dto;

import com.falconsvsvabro.ecocampus.conversation.Conversation;
import java.time.OffsetDateTime;

public record ConversationResponse(Long id, Long itemId, String itemTitle, Long targetUserId, String targetNickname,
		String lastMessage, OffsetDateTime lastMessageAt, OffsetDateTime createdAt) {

	public static ConversationResponse from(Conversation conversation, String itemTitle, Long currentUserId,
			String targetNickname) {
		return new ConversationResponse(conversation.getId(), conversation.getItemId(), itemTitle,
				conversation.otherUserId(currentUserId), targetNickname, conversation.getLastMessage(),
				conversation.getLastMessageAt(), conversation.getCreatedAt());
	}
}
