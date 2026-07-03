package com.falconsvsvabro.ecocampus.order;

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
class OrderControllerTests {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	@Autowired
	private JdbcTemplate jdbcTemplate;

	@Test
	void buyerAndSellerCanMoveOrderThroughPickupFlow() throws Exception {
		String sellerToken = loginAndVerify("13800000061", "2026000061");
		long itemId = createAndApproveItem(sellerToken, "Orderable Campus Racket");
		String buyerToken = loginAndVerify("13800000062", "2026000062");

		MvcResult created = mockMvc.perform(post("/api/v1/orders")
			.header("Authorization", "Bearer " + buyerToken)
			.contentType(MediaType.APPLICATION_JSON)
			.content("""
					{
					  "itemId": %d,
					  "deliveryMode": "SELF_PICKUP",
					  "remark": "Meet at the gym gate"
					}
					""".formatted(itemId)))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.data.status").value("PENDING_COMMUNICATION"))
			.andReturn();

		long orderId = read(created, "/data/id").asLong();

		mockMvc.perform(get("/api/v1/orders")
			.header("Authorization", "Bearer " + buyerToken)
			.param("role", "BUYER")
			.param("status", "PENDING_COMMUNICATION"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.data.items[0].id").value(orderId));

		mockMvc.perform(get("/api/v1/orders")
			.header("Authorization", "Bearer " + sellerToken)
			.param("role", "SELLER"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.data.items[0].id").value(orderId));

		mockMvc.perform(post("/api/v1/orders/{orderId}/status", orderId)
			.header("Authorization", "Bearer " + sellerToken)
			.contentType(MediaType.APPLICATION_JSON)
			.content("""
					{"targetStatus":"WAITING_PICKUP","remark":"Tomorrow 18:00"}
					"""))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.data.status").value("WAITING_PICKUP"));

		mockMvc.perform(get("/api/v1/orders/{orderId}", orderId).header("Authorization", "Bearer " + buyerToken))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.data.remark").value("Tomorrow 18:00"));

		mockMvc.perform(post("/api/v1/orders/{orderId}/status", orderId)
			.header("Authorization", "Bearer " + buyerToken)
			.contentType(MediaType.APPLICATION_JSON)
			.content("""
					{"targetStatus":"COMPLETED","remark":"Picked up"}
					"""))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.data.status").value("COMPLETED"));

		mockMvc.perform(get("/api/v1/items/{itemId}", itemId))
			.andExpect(status().isNotFound())
			.andExpect(jsonPath("$.code").value("NOT_FOUND"));
	}

	@Test
	void invalidOrderStatusTransitionReturnsConflict() throws Exception {
		String sellerToken = loginAndVerify("13800000063", "2026000063");
		long itemId = createAndApproveItem(sellerToken, "Order Conflict Item");
		String buyerToken = loginAndVerify("13800000064", "2026000064");

		MvcResult created = mockMvc.perform(post("/api/v1/orders")
			.header("Authorization", "Bearer " + buyerToken)
			.contentType(MediaType.APPLICATION_JSON)
			.content("""
					{"itemId":%d,"deliveryMode":"SELF_PICKUP"}
					""".formatted(itemId)))
			.andExpect(status().isOk())
			.andReturn();
		long orderId = read(created, "/data/id").asLong();

		mockMvc.perform(post("/api/v1/orders/{orderId}/status", orderId)
			.header("Authorization", "Bearer " + buyerToken)
			.contentType(MediaType.APPLICATION_JSON)
			.content("""
					{"targetStatus":"COMPLETED"}
					"""))
			.andExpect(status().isConflict())
			.andExpect(jsonPath("$.code").value("CONFLICT"));
	}

	private long createAndApproveItem(String sellerToken, String title) throws Exception {
		MvcResult created = mockMvc.perform(post("/api/v1/items")
			.header("Authorization", "Bearer " + sellerToken)
			.contentType(MediaType.APPLICATION_JSON)
			.content("""
					{
					  "title": "%s",
					  "description": "Order test item.",
					  "categoryId": 4,
					  "priceCent": 6600,
					  "deliveryModes": ["SELF_PICKUP"],
					  "imageUrls": ["https://cdn.example.com/order.png"]
					}
					""".formatted(title)))
			.andExpect(status().isOk())
			.andReturn();
		long itemId = read(created, "/data/id").asLong();
		String adminToken = loginAsAdmin("13800000065");
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
		String token = login(phone);
		jdbcTemplate.update("update users set role = 'ADMIN' where phone = ?", phone);
		return token;
	}

	private String loginAndVerify(String phone, String studentNo) throws Exception {
		String accessToken = login(phone);
		mockMvc.perform(post("/api/v1/auth/campus-verification")
			.header("Authorization", "Bearer " + accessToken)
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
		return accessToken;
	}

	private String login(String phone) throws Exception {
		mockMvc.perform(post("/api/v1/auth/sms-code").contentType(MediaType.APPLICATION_JSON)
			.content("""
					{"phone":"%s"}
					""".formatted(phone)))
			.andExpect(status().isOk());
		MvcResult login = mockMvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON)
			.content("""
					{"phone":"%s","code":"123456"}
					""".formatted(phone)))
			.andExpect(status().isOk())
			.andReturn();
		return read(login, "/data/accessToken").asText();
	}

	private JsonNode read(MvcResult result, String pointer) throws Exception {
		return objectMapper.readTree(result.getResponse().getContentAsString()).at(pointer);
	}
}
