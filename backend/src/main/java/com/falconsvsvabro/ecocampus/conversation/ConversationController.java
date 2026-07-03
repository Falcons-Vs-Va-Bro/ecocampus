package com.falconsvsvabro.ecocampus.conversation;

import com.falconsvsvabro.ecocampus.auth.AuthenticatedUser;
import com.falconsvsvabro.ecocampus.common.api.ApiResponse;
import com.falconsvsvabro.ecocampus.conversation.dto.ConversationResponse;
import com.falconsvsvabro.ecocampus.conversation.dto.CreateConversationRequest;
import com.falconsvsvabro.ecocampus.conversation.dto.MessageResponse;
import com.falconsvsvabro.ecocampus.conversation.dto.SendMessageRequest;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/conversations")
public class ConversationController {

	private final ConversationService conversationService;

	public ConversationController(ConversationService conversationService) {
		this.conversationService = conversationService;
	}

	@PostMapping
	ApiResponse<ConversationResponse> createOrGetConversation(@AuthenticationPrincipal AuthenticatedUser currentUser,
			@Valid @RequestBody CreateConversationRequest requestBody, HttpServletRequest request) {
		return ApiResponse.ok(conversationService.createOrGet(currentUser.id(), requestBody), traceId(request));
	}

	@GetMapping
	ApiResponse<List<ConversationResponse>> listConversations(@AuthenticationPrincipal AuthenticatedUser currentUser,
			HttpServletRequest request) {
		return ApiResponse.ok(conversationService.listConversations(currentUser.id()), traceId(request));
	}

	@GetMapping("/{conversationId}/messages")
	ApiResponse<List<MessageResponse>> listMessages(@AuthenticationPrincipal AuthenticatedUser currentUser,
			@PathVariable Long conversationId, HttpServletRequest request) {
		return ApiResponse.ok(conversationService.listMessages(currentUser.id(), conversationId), traceId(request));
	}

	@PostMapping("/{conversationId}/messages")
	ApiResponse<MessageResponse> sendMessage(@AuthenticationPrincipal AuthenticatedUser currentUser,
			@PathVariable Long conversationId, @Valid @RequestBody SendMessageRequest requestBody,
			HttpServletRequest request) {
		return ApiResponse.ok(conversationService.sendMessage(currentUser.id(), conversationId, requestBody),
				traceId(request));
	}

	private String traceId(HttpServletRequest request) {
		String traceId = request.getHeader("X-Trace-Id");
		if (traceId != null && !traceId.isBlank()) {
			return traceId;
		}
		return UUID.randomUUID().toString();
	}
}
