package com.falconsvsvabro.ecocampus.conversation;

import com.falconsvsvabro.ecocampus.auth.CampusAccessGuard;
import com.falconsvsvabro.ecocampus.common.api.BusinessException;
import com.falconsvsvabro.ecocampus.common.api.ErrorCode;
import com.falconsvsvabro.ecocampus.common.api.PageResponse;
import com.falconsvsvabro.ecocampus.conversation.dto.ConversationResponse;
import com.falconsvsvabro.ecocampus.conversation.dto.CreateConversationRequest;
import com.falconsvsvabro.ecocampus.conversation.dto.MessageResponse;
import com.falconsvsvabro.ecocampus.conversation.dto.SendMessageRequest;
import com.falconsvsvabro.ecocampus.item.Item;
import com.falconsvsvabro.ecocampus.item.ItemRepository;
import com.falconsvsvabro.ecocampus.user.User;
import com.falconsvsvabro.ecocampus.user.UserRepository;
import com.falconsvsvabro.ecocampus.user.VerificationStatus;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ConversationService {

	private final ConversationRepository conversationRepository;
	private final ConversationMessageRepository messageRepository;
	private final ItemRepository itemRepository;
	private final UserRepository userRepository;
	private final CampusAccessGuard campusAccessGuard;

	public ConversationService(ConversationRepository conversationRepository,
			ConversationMessageRepository messageRepository, ItemRepository itemRepository, UserRepository userRepository,
			CampusAccessGuard campusAccessGuard) {
		this.conversationRepository = conversationRepository;
		this.messageRepository = messageRepository;
		this.itemRepository = itemRepository;
		this.userRepository = userRepository;
		this.campusAccessGuard = campusAccessGuard;
	}

	@Transactional
	public ConversationResponse createOrGet(Long userId, CreateConversationRequest request) {
		User currentUser = campusAccessGuard.requireVerifiedUser(userId);
		User targetUser = getVerifiedTargetUser(request.targetUserId());
		if (currentUser.getId().equals(targetUser.getId())) {
			throw new BusinessException(ErrorCode.CONFLICT, "cannot create conversation with self");
		}
		Item item = getItemForUpdate(request.itemId());
		if (!item.getSellerId().equals(currentUser.getId()) && !item.getSellerId().equals(targetUser.getId())) {
			throw new BusinessException(ErrorCode.FORBIDDEN, "conversation must include item seller");
		}
		Long userOneId = Math.min(currentUser.getId(), targetUser.getId());
		Long userTwoId = Math.max(currentUser.getId(), targetUser.getId());
		Conversation conversation = conversationRepository.findByItemIdAndUserOneIdAndUserTwoId(item.getId(), userOneId,
				userTwoId)
			.orElseGet(() -> conversationRepository.save(new Conversation(item.getId(), userOneId, userTwoId)));
		return toResponse(conversation, currentUser.getId());
	}

	@Transactional(readOnly = true)
	public PageResponse<ConversationResponse> listConversations(Long userId, int page, int size) {
		User user = campusAccessGuard.requireVerifiedUser(userId);
		Pageable pageable = PageRequest.of(normalizePage(page) - 1, normalizeSize(size));
		var conversationPage = conversationRepository.findByParticipant(user.getId(), pageable);
		List<ConversationResponse> items = conversationPage.getContent()
			.stream()
			.map(conversation -> toResponse(conversation, user.getId()))
			.toList();
		return new PageResponse<>(items, normalizePage(page), normalizeSize(size), conversationPage.getTotalElements());
	}

	@Transactional
	public PageResponse<MessageResponse> listMessages(Long userId, Long conversationId, int page, int size) {
		User user = campusAccessGuard.requireVerifiedUser(userId);
		Conversation conversation = getConversation(conversationId);
		ensureParticipant(conversation, user.getId());
		conversation.markRead(user.getId());
		Pageable pageable = PageRequest.of(normalizePage(page) - 1, normalizeSize(size));
		var messagePage = messageRepository.findByConversationIdOrderByCreatedAtAscIdAsc(conversation.getId(),
				pageable);
		List<MessageResponse> items = messagePage.getContent()
			.stream()
			.map(MessageResponse::from)
			.toList();
		return new PageResponse<>(items, normalizePage(page), normalizeSize(size), messagePage.getTotalElements());
	}

	@Transactional
	public MessageResponse sendMessage(Long userId, Long conversationId, SendMessageRequest request) {
		User user = campusAccessGuard.requireVerifiedUser(userId);
		Conversation conversation = getConversationForUpdate(conversationId);
		ensureParticipant(conversation, user.getId());
		ConversationMessage message = messageRepository
			.save(new ConversationMessage(conversation.getId(), user.getId(), request.content()));
		conversation.updateLastMessage(request.content());
		conversation.markRead(user.getId());
		return MessageResponse.from(message);
	}

	private ConversationResponse toResponse(Conversation conversation, Long currentUserId) {
		Item item = getItem(conversation.getItemId());
		User targetUser = userRepository.findById(conversation.otherUserId(currentUserId))
			.orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "user not found"));
		long unreadCount = messageRepository.countUnread(conversation.getId(), currentUserId,
				conversation.readAt(currentUserId));
		return ConversationResponse.from(conversation, item.getTitle(), currentUserId, targetUser.getNickname())
			.withUnreadCount(unreadCount);
	}

	private Conversation getConversation(Long conversationId) {
		return conversationRepository.findById(conversationId)
			.orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "conversation not found"));
	}

	private Conversation getConversationForUpdate(Long conversationId) {
		return conversationRepository.findByIdForUpdate(conversationId)
			.orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "conversation not found"));
	}

	private void ensureParticipant(Conversation conversation, Long userId) {
		if (!conversation.involves(userId)) {
			throw new BusinessException(ErrorCode.FORBIDDEN, "conversation does not belong to current user");
		}
	}

	private Item getItem(Long itemId) {
		return itemRepository.findById(itemId)
			.orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "item not found"));
	}

	private Item getItemForUpdate(Long itemId) {
		return itemRepository.findByIdForUpdate(itemId)
			.orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "item not found"));
	}

	private User getVerifiedTargetUser(Long userId) {
		User user = userRepository.findById(userId)
			.orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "user not found"));
		if (user.getVerificationStatus() != VerificationStatus.VERIFIED) {
			throw new BusinessException(ErrorCode.FORBIDDEN, "target user is not campus verified");
		}
		return user;
	}

	private int normalizePage(int page) {
		return Math.max(page, 1);
	}

	private int normalizeSize(int size) {
		if (size < 1) {
			return 20;
		}
		return Math.min(size, 100);
	}
}
