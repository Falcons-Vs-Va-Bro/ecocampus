package com.falconsvsvabro.ecocampus.conversation;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.OffsetDateTime;

public interface ConversationMessageRepository extends JpaRepository<ConversationMessage, Long> {

	Page<ConversationMessage> findByConversationIdOrderByCreatedAtAscIdAsc(Long conversationId, Pageable pageable);

	@Query("""
			select count(message) from ConversationMessage message
			where message.conversationId = :conversationId
			  and message.senderId <> :currentUserId
			  and (:readAt is null or message.createdAt > :readAt)
			""")
	long countUnread(@Param("conversationId") Long conversationId, @Param("currentUserId") Long currentUserId,
			@Param("readAt") OffsetDateTime readAt);
}
