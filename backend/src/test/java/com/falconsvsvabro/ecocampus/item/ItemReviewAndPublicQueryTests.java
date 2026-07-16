package com.falconsvsvabro.ecocampus.item;

import static org.hamcrest.Matchers.hasItem;
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
class ItemReviewAndPublicQueryTests {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	@Autowired
	private JdbcTemplate jdbcTemplate;

	@Test
	void publicItemListIgnoresInvalidBearerTokenButProtectedItemActionsDoNot() throws Exception {
		mockMvc.perform(get("/api/v1/items")
			.header("Authorization", "Bearer expired-or-invalid-token")
			.param("page", "1")
			.param("size", "80"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.data.items").isArray());

		mockMvc.perform(post("/api/v1/items")
			.header("Authorization", "Bearer expired-or-invalid-token")
			.contentType(MediaType.APPLICATION_JSON)
			.content("{}"))
			.andExpect(status().isUnauthorized());
	}

	@Test
	void adminCanReviewItemAndPublicCanQueryOnSaleItems() throws Exception {
		String sellerToken = loginAndVerify("229202400041", "2026000041");
		long itemId = createItem(sellerToken, "Reviewable ZX900 Monitor");
		String adminToken = loginAsAdmin("229202400042");

		mockMvc.perform(get("/api/v1/admin/items/review")
			.header("Authorization", "Bearer " + adminToken)
			.param("status", "PENDING_REVIEW"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.data.items[*].id", hasItem((int) itemId)))
			.andExpect(jsonPath("$.data.items[0].description").value("24 inch display, good condition."))
			.andExpect(jsonPath("$.data.items[0].coverImageUrl").value("https://cdn.example.com/monitor.png"))
			.andExpect(jsonPath("$.data.items[0].imageCount").value(1));

		mockMvc.perform(post("/api/v1/admin/items/{itemId}/review", itemId)
			.header("Authorization", "Bearer " + adminToken)
			.contentType(MediaType.APPLICATION_JSON)
			.content("""
					{"approved":true,"reason":"complete campus item information"}
					"""))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.data.status").value("ON_SALE"));

		mockMvc.perform(get("/api/v1/items")
			.param("keyword", "ZX900")
			.param("categoryId", "2")
			.param("deliveryMode", "SELF_PICKUP"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.data.total").value(1))
			.andExpect(jsonPath("$.data.items[0].id").value(itemId));

		mockMvc.perform(get("/api/v1/items/{itemId}", itemId))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.data.seller.nickname").value("Eco User"))
			.andExpect(jsonPath("$.data.favorited").value(false))
			.andExpect(jsonPath("$.data.favoriteCount").value(0));

		mockMvc.perform(get("/api/v1/admin/items")
			.header("Authorization", "Bearer " + adminToken)
			.param("status", "ON_SALE")
			.param("keyword", "ZX900"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.data.items[0].sellerNickname").value("Eco User"));

		mockMvc.perform(post("/api/v1/admin/items/{itemId}/violation-remove", itemId)
			.header("Authorization", "Bearer " + adminToken)
			.contentType(MediaType.APPLICATION_JSON)
			.content("""
					{"reason":"suspected merchant listing"}
					"""))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.data.status").value("VIOLATION_REMOVED"));

		mockMvc.perform(get("/api/v1/items").param("keyword", "ZX900"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.data.total").value(0));
	}

	private long createItem(String accessToken, String title) throws Exception {
		MvcResult created = mockMvc.perform(post("/api/v1/items")
			.header("Authorization", "Bearer " + accessToken)
			.contentType(MediaType.APPLICATION_JSON)
			.content("""
					{
					  "title": "%s",
					  "description": "24 inch display, good condition.",
					  "categoryId": 2,
					  "priceCent": 26000,
					  "deliveryModes": ["SELF_PICKUP"],
					  "imageUrls": ["https://cdn.example.com/monitor.png"]
					}
					""".formatted(title)))
			.andExpect(status().isOk())
			.andReturn();
		return read(created, "/data/id").asLong();
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
		MvcResult login = mockMvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON)
			.content("""
					{"account":"%s","password":"test-password"}
					""".formatted(phone)))
			.andExpect(status().isOk())
			.andReturn();
		return read(login, "/data/accessToken").asText();
	}

	private JsonNode read(MvcResult result, String pointer) throws Exception {
		return objectMapper.readTree(result.getResponse().getContentAsString()).at(pointer);
	}
}
