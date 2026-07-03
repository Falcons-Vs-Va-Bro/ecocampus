package com.falconsvsvabro.ecocampus.conversation.dto;

import jakarta.validation.constraints.NotNull;

public record CreateConversationRequest(@NotNull Long itemId, @NotNull Long targetUserId) {
}
