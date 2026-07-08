package com.falconsvsvabro.ecocampus.conversation;

import java.util.Optional;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {

	/**
	 * 悲观写锁：发送消息时锁定会话，保证 lastMessage 始终对应最后一次提交的消息。
	 */
	@Lock(LockModeType.PESSIMISTIC_WRITE)
	@Query("select conversation from Conversation conversation where conversation.id = :id")
	Optional<Conversation> findByIdForUpdate(@Param("id") Long id);

	Optional<Conversation> findByItemIdAndUserOneIdAndUserTwoId(Long itemId, Long userOneId, Long userTwoId);

	@Query("""
			select conversation from Conversation conversation
			where conversation.userOneId = :userId or conversation.userTwoId = :userId
			order by conversation.lastMessageAt desc nulls last, conversation.createdAt desc
			""")
	Page<Conversation> findByParticipant(@Param("userId") Long userId, Pageable pageable);
}
