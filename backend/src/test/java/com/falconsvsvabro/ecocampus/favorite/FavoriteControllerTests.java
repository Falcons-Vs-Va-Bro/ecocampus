package com.falconsvsvabro.ecocampus.favorite;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
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
class FavoriteControllerTests {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	@Autowired
	private JdbcTemplate jdbcTemplate;

	@Test
	void verifiedUserCanFavoriteAndUnfavoriteOnSaleItem() throws Exception {
		String sellerToken = loginAndVerify("13800000051", "2026000051");
		long itemId = createAndApproveItem(sellerToken, "Favorite Campus Bike");
		String buyerToken = loginAndVerify("13800000052", "2026000052");

		mockMvc.perform(post("/api/v1/items/{itemId}/favorite", itemId)
			.header("Authorization", "Bearer " + buyerToken))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.data.favorited").value(true))
			.andExpect(jsonPath("$.data.favoriteCount").value(1));

		mockMvc.perform(post("/api/v1/items/{itemId}/favorite", itemId)
			.header("Authorization", "Bearer " + buyerToken))
			.andExpect(status().isConflict())
			.andExpect(jsonPath("$.code").value("CONFLICT"));

		mockMvc.perform(get("/api/v1/items/{itemId}", itemId).header("Authorization", "Bearer " + buyerToken))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.data.favorited").value(true))
			.andExpect(jsonPath("$.data.favoriteCount").value(1));

		mockMvc.perform(get("/api/v1/users/me/favorites").header("Authorization", "Bearer " + buyerToken))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.data.total").value(1))
			.andExpect(jsonPath("$.data.items[0].id").value(itemId));

		mockMvc.perform(delete("/api/v1/items/{itemId}/favorite", itemId)
			.header("Authorization", "Bearer " + buyerToken))
			.andExpect(status().isOk());

		mockMvc.perform(get("/api/v1/items/{itemId}", itemId).header("Authorization", "Bearer " + buyerToken))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.data.favorited").value(false))
			.andExpect(jsonPath("$.data.favoriteCount").value(0));
	}

	private long createAndApproveItem(String sellerToken, String title) throws Exception {
		MvcResult created = mockMvc.perform(post("/api/v1/items")
			.header("Authorization", "Bearer " + sellerToken)
			.contentType(MediaType.APPLICATION_JSON)
			.content("""
					{
					  "title": "%s",
					  "description": "Campus transfer ready.",
					  "categoryId": 4,
					  "priceCent": 8800,
					  "deliveryModes": ["SELF_PICKUP"],
					  "imageUrls": ["https://cdn.example.com/bike.png"]
					}
					""".formatted(title)))
			.andExpect(status().isOk())
			.andReturn();
		long itemId = read(created, "/data/id").asLong();
		String adminToken = loginAsAdmin("13800000053");
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
