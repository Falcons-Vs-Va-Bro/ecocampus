package com.falconsvsvabro.ecocampus.item;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
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
class ItemSellerControllerTests {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	@Autowired
	private JdbcTemplate jdbcTemplate;

	@Test
	void verifiedSellerCanManageOwnItems() throws Exception {
		String accessToken = loginAndVerify("229202400031", "2026000031");

		MvcResult created = mockMvc.perform(post("/api/v1/items")
			.header("Authorization", "Bearer " + accessToken)
			.contentType(MediaType.APPLICATION_JSON)
			.content(itemPayload("Data Structures", 1, 3200)))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.data.status").value("PENDING_REVIEW"))
			.andExpect(jsonPath("$.data.categoryName").value("教材"))
			.andReturn();

		long itemId = read(created, "/data/id").asLong();

		mockMvc.perform(get("/api/v1/users/me/items")
			.header("Authorization", "Bearer " + accessToken)
			.param("status", "PENDING_REVIEW"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.data.items[0].id").value(itemId))
			.andExpect(jsonPath("$.data.items[0].coverImageUrl").value("https://cdn.example.com/item.png"));

		mockMvc.perform(put("/api/v1/items/{itemId}", itemId)
			.header("Authorization", "Bearer " + accessToken)
			.contentType(MediaType.APPLICATION_JSON)
			.content(itemPayload("Updated Data Structures", 1, 3000)))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.data.title").value("Updated Data Structures"))
			.andExpect(jsonPath("$.data.status").value("PENDING_REVIEW"));

		jdbcTemplate.update("update items set status = 'ON_SALE' where id = ?", itemId);

		mockMvc.perform(post("/api/v1/items/{itemId}/off-shelf", itemId)
			.header("Authorization", "Bearer " + accessToken))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.data.status").value("OFF_SHELF"));

		mockMvc.perform(post("/api/v1/items/{itemId}/on-sale", itemId)
			.header("Authorization", "Bearer " + accessToken))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.data.status").value("PENDING_REVIEW"));
	}

	@Test
	void unverifiedUserCannotPublishItem() throws Exception {
		String accessToken = login("229202400032");
		jdbcTemplate.update("update users set verification_status = 'UNVERIFIED' where phone = ?", "229202400032");

		mockMvc.perform(post("/api/v1/items")
			.header("Authorization", "Bearer " + accessToken)
			.contentType(MediaType.APPLICATION_JSON)
			.content(itemPayload("Keyboard", 2, 12000)))
			.andExpect(status().isForbidden())
			.andExpect(jsonPath("$.code").value("FORBIDDEN"));
	}

	private String itemPayload(String title, long categoryId, long priceCent) {
		return """
				{
				  "title": "%s",
				  "description": "Lightly used and ready for campus pickup.",
				  "categoryId": %d,
				  "priceCent": %d,
				  "deliveryModes": ["SELF_PICKUP", "DELIVER_TO_SCHOOL"],
				  "imageUrls": ["https://cdn.example.com/item.png"]
				}
				""".formatted(title, categoryId, priceCent);
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
