package com.falconsvsvabro.ecocampus.conversation;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {

	Optional<Conversation> findByItemIdAndUserOneIdAndUserTwoId(Long itemId, Long userOneId, Long userTwoId);

	@Query("""
			select conversation from Conversation conversation
			where conversation.userOneId = :userId or conversation.userTwoId = :userId
			order by conversation.lastMessageAt desc nulls last, conversation.createdAt desc
			""")
	List<Conversation> findByParticipant(@Param("userId") Long userId);
}
