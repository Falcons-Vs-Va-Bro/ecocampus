package com.falconsvsvabro.ecocampus.conversation;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConversationMessageRepository extends JpaRepository<ConversationMessage, Long> {

	Page<ConversationMessage> findByConversationIdOrderByCreatedAtAscIdAsc(Long conversationId, Pageable pageable);
}
