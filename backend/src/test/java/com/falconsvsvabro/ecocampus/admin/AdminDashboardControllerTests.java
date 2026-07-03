package com.falconsvsvabro.ecocampus.admin;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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
class AdminDashboardControllerTests {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	@Autowired
	private JdbcTemplate jdbcTemplate;

	@Test
	void adminCanReadDashboardOverview() throws Exception {
		String sellerToken = loginAndVerify("13800000111", "2026000111");
		long itemId = createAndApproveItem(sellerToken, "Dashboard Completed Item");
		String buyerToken = loginAndVerify("13800000112", "2026000112");
		completeOrder(buyerToken, sellerToken, itemId);
		AuthSession admin = loginAsAdmin("13800000113");

		MvcResult result = mockMvc.perform(get("/api/v1/admin/dashboard/overview")
			.header("Authorization", "Bearer " + admin.token()))
			.andExpect(status().isOk())
			.andReturn();

		JsonNode data = read(result, "/data");
		assertThat(data.get("itemPublishCount").asLong()).isGreaterThanOrEqualTo(1);
		assertThat(data.get("orderCompletedCount").asLong()).isGreaterThanOrEqualTo(1);
		assertThat(data.get("activeUserCount").asLong()).isGreaterThanOrEqualTo(2);
		JsonNode digitalStat = findCategoryStat(data.get("categoryStats"), "数码");
		assertThat(digitalStat).isNotNull();
		assertThat(digitalStat.get("itemCount").asLong()).isGreaterThanOrEqualTo(1);
		assertThat(digitalStat.get("completedOrderCount").asLong()).isGreaterThanOrEqualTo(1);
	}

	private JsonNode findCategoryStat(JsonNode categoryStats, String categoryName) {
		for (JsonNode stat : categoryStats) {
			if (categoryName.equals(stat.get("categoryName").asText())) {
				return stat;
			}
		}
		return null;
	}

	private void completeOrder(String buyerToken, String sellerToken, long itemId) throws Exception {
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
			.header("Authorization", "Bearer " + sellerToken)
			.contentType(MediaType.APPLICATION_JSON)
			.content("""
					{"targetStatus":"WAITING_PICKUP"}
					"""))
			.andExpect(status().isOk());
		mockMvc.perform(post("/api/v1/orders/{orderId}/status", orderId)
			.header("Authorization", "Bearer " + buyerToken)
			.contentType(MediaType.APPLICATION_JSON)
			.content("""
					{"targetStatus":"COMPLETED"}
					"""))
			.andExpect(status().isOk());
	}

	private long createAndApproveItem(String sellerToken, String title) throws Exception {
		MvcResult created = mockMvc.perform(post("/api/v1/items")
			.header("Authorization", "Bearer " + sellerToken)
			.contentType(MediaType.APPLICATION_JSON)
			.content("""
					{
					  "title": "%s",
					  "description": "Dashboard statistic item.",
					  "categoryId": 2,
					  "priceCent": 22000,
					  "deliveryModes": ["SELF_PICKUP"],
					  "imageUrls": ["https://cdn.example.com/dashboard.png"]
					}
					""".formatted(title)))
			.andExpect(status().isOk())
			.andReturn();
		long itemId = read(created, "/data/id").asLong();
		String adminToken = loginAsAdmin("13800000114").token();
		mockMvc.perform(post("/api/v1/admin/items/{itemId}/review", itemId)
			.header("Authorization", "Bearer " + adminToken)
			.contentType(MediaType.APPLICATION_JSON)
			.content("""
					{"approved":true,"reason":"ok"}
					"""))
			.andExpect(status().isOk());
		return itemId;
	}

	private AuthSession loginAsAdmin(String phone) throws Exception {
		AuthSession session = login(phone);
		jdbcTemplate.update("update users set role = 'ADMIN' where phone = ?", phone);
		return session;
	}

	private String loginAndVerify(String phone, String studentNo) throws Exception {
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
		return session.token();
	}

	private AuthSession login(String phone) throws Exception {
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
		return new AuthSession(read(login, "/data/accessToken").asText(), read(login, "/data/user/id").asLong());
	}

	private JsonNode read(MvcResult result, String pointer) throws Exception {
		return objectMapper.readTree(result.getResponse().getContentAsString()).at(pointer);
	}

	private record AuthSession(String token, long userId) {
	}
}
