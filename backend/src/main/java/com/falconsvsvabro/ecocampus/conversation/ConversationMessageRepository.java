package com.falconsvsvabro.ecocampus.conversation;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConversationMessageRepository extends JpaRepository<ConversationMessage, Long> {

	List<ConversationMessage> findByConversationIdOrderByCreatedAtAscIdAsc(Long conversationId);
}
