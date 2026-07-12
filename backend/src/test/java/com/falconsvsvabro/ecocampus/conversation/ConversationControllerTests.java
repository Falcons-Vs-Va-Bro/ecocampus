package com.falconsvsvabro.ecocampus.conversation;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
class ConversationControllerTests {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	@Autowired
	private JdbcTemplate jdbcTemplate;

	@Test
	void participantsCanChatInItemConversation() throws Exception {
		AuthSession seller = loginAndVerify("229202400081", "2026000081");
		long itemId = createAndApproveItem(seller.token(), "Chat Campus Calculator");
		AuthSession buyer = loginAndVerify("229202400082", "2026000082");

		MvcResult created = mockMvc.perform(post("/api/v1/conversations")
			.header("Authorization", "Bearer " + buyer.token())
			.contentType(MediaType.APPLICATION_JSON)
			.content("""
					{"itemId":%d,"targetUserId":%d}
					""".formatted(itemId, seller.userId())))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.data.itemId").value(itemId))
			.andExpect(jsonPath("$.data.targetUserId").value(seller.userId()))
			.andReturn();

		long conversationId = read(created, "/data/id").asLong();

		mockMvc.perform(post("/api/v1/conversations/{conversationId}/messages", conversationId)
			.header("Authorization", "Bearer " + buyer.token())
			.contentType(MediaType.APPLICATION_JSON)
			.content("""
					{"content":"Can I pick it up this afternoon?"}
					"""))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.data.senderId").value(buyer.userId()));

		mockMvc.perform(post("/api/v1/conversations/{conversationId}/messages", conversationId)
			.header("Authorization", "Bearer " + seller.token())
			.contentType(MediaType.APPLICATION_JSON)
			.content("""
					{"content":"Sure, after 4 pm works."}
					"""))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.data.senderId").value(seller.userId()));

		mockMvc.perform(get("/api/v1/conversations").header("Authorization", "Bearer " + seller.token())
			.param("page", "1")
			.param("size", "1"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.data.items[0].lastMessage").value("Sure, after 4 pm works."))
			.andExpect(jsonPath("$.data.page").value(1))
			.andExpect(jsonPath("$.data.size").value(1))
			.andExpect(jsonPath("$.data.total").value(1));

		mockMvc.perform(get("/api/v1/conversations").header("Authorization", "Bearer " + buyer.token()))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.data.items[0].unreadCount").value(1));

		mockMvc.perform(get("/api/v1/conversations/{conversationId}/messages", conversationId)
			.header("Authorization", "Bearer " + seller.token())
			.param("page", "1")
			.param("size", "1"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.data.items[0].content").value("Can I pick it up this afternoon?"))
			.andExpect(jsonPath("$.data.page").value(1))
			.andExpect(jsonPath("$.data.size").value(1))
			.andExpect(jsonPath("$.data.total").value(2));

		mockMvc.perform(get("/api/v1/conversations/{conversationId}/messages", conversationId)
			.header("Authorization", "Bearer " + buyer.token()))
			.andExpect(status().isOk());

		mockMvc.perform(get("/api/v1/conversations").header("Authorization", "Bearer " + buyer.token()))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.data.items[0].unreadCount").value(0));
	}

	@Test
	void nonParticipantCannotReadConversationMessages() throws Exception {
		AuthSession seller = loginAndVerify("229202400083", "2026000083");
		long itemId = createAndApproveItem(seller.token(), "Private Conversation Item");
		AuthSession buyer = loginAndVerify("229202400084", "2026000084");
		AuthSession stranger = loginAndVerify("229202400085", "2026000085");

		MvcResult created = mockMvc.perform(post("/api/v1/conversations")
			.header("Authorization", "Bearer " + buyer.token())
			.contentType(MediaType.APPLICATION_JSON)
			.content("""
					{"itemId":%d,"targetUserId":%d}
					""".formatted(itemId, seller.userId())))
			.andExpect(status().isOk())
			.andReturn();
		long conversationId = read(created, "/data/id").asLong();

		mockMvc.perform(get("/api/v1/conversations/{conversationId}/messages", conversationId)
			.header("Authorization", "Bearer " + stranger.token()))
			.andExpect(status().isForbidden())
			.andExpect(jsonPath("$.code").value("FORBIDDEN"));
	}

	private long createAndApproveItem(String sellerToken, String title) throws Exception {
		MvcResult created = mockMvc.perform(post("/api/v1/items")
			.header("Authorization", "Bearer " + sellerToken)
			.contentType(MediaType.APPLICATION_JSON)
			.content("""
					{
					  "title": "%s",
					  "description": "Conversation test item.",
					  "categoryId": 2,
					  "priceCent": 12000,
					  "deliveryModes": ["SELF_PICKUP"],
					  "imageUrls": ["https://cdn.example.com/chat.png"]
					}
					""".formatted(title)))
			.andExpect(status().isOk())
			.andReturn();
		long itemId = read(created, "/data/id").asLong();
		String adminToken = loginAsAdmin("229202400086");
		mockMvc.perform(post("/api/v1/admin/items/{itemId}/review", itemId)
			.header("Authorization", "Bearer " + adminToken)
			.contentType(MediaType.APPLICATION_JSON)
			.content("""
					{"approved":true,"reason":"ok"}
					"""))
			.andExpect(status().isOk());
		return itemId;
	}

	private String loginAsAdmin(String phone) throws Exception {
		AuthSession session = login(phone);
		jdbcTemplate.update("update users set role = 'ADMIN' where phone = ?", phone);
		return session.token();
	}

	private AuthSession loginAndVerify(String phone, String studentNo) throws Exception {
		AuthSession session = login(phone);
		mockMvc.perform(post("/api/v1/auth/campus-verification")
			.header("Authorization", "Bearer " + session.token())
			.contentType(MediaType.APPLICATION_JSON)
			.content("""
					{
					  "realName": "Zhang San",
					  "studentNo": "%s",
					  "college": "Information School",
					  "grade": "2026"
					}
					""".formatted(studentNo)))
			.andExpect(status().isOk());
		return session;
	}

	private AuthSession login(String phone) throws Exception {
		MvcResult login = mockMvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON)
			.content("""
					{"account":"%s","password":"test-password"}
					""".formatted(phone)))
			.andExpect(status().isOk())
			.andReturn();
		return new AuthSession(read(login, "/data/accessToken").asText(), read(login, "/data/user/id").asLong());
	}

	private JsonNode read(MvcResult result, String pointer) throws Exception {
		return objectMapper.readTree(result.getResponse().getContentAsString()).at(pointer);
	}

	private record AuthSession(String token, long userId) {
	}
}
