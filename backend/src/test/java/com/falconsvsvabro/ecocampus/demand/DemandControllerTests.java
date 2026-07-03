package com.falconsvsvabro.ecocampus.demand;

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
class DemandControllerTests {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	@Autowired
	private JdbcTemplate jdbcTemplate;

	@Test
	void verifiedUserCanPublishCloseAndMatchDemand() throws Exception {
		String sellerToken = loginAndVerify("13800000091", "2026000091");
		long itemId = createAndApproveItem(sellerToken, "24 inch campus monitor");
		String buyerToken = loginAndVerify("13800000092", "2026000092");

		MvcResult created = mockMvc.perform(post("/api/v1/demands")
			.header("Authorization", "Bearer " + buyerToken)
			.contentType(MediaType.APPLICATION_JSON)
			.content("""
					{
					  "title": "Looking for monitor",
					  "description": "Need a 24 inch screen under 300",
					  "categoryId": 2,
					  "budgetMinCent": 10000,
					  "budgetMaxCent": 30000,
					  "keywords": ["monitor", "24"]
					}
					"""))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.data.status").value("OPEN"))
			.andReturn();
		long demandId = read(created, "/data/id").asLong();

		mockMvc.perform(get("/api/v1/demands").param("categoryId", "2").param("keyword", "monitor"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.data.items[0].id").value(demandId));

		mockMvc.perform(get("/api/v1/users/me/demands").header("Authorization", "Bearer " + buyerToken))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.data.items[0].title").value("Looking for monitor"));

		mockMvc.perform(get("/api/v1/demands/{demandId}/matches", demandId)
			.header("Authorization", "Bearer " + buyerToken))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.data[0].itemId").value(itemId))
			.andExpect(jsonPath("$.data[0].matchReason").value("keyword and budget matched"));

		mockMvc.perform(post("/api/v1/demands/{demandId}/close", demandId)
			.header("Authorization", "Bearer " + buyerToken))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.data.status").value("CLOSED"));
	}

	private long createAndApproveItem(String sellerToken, String title) throws Exception {
		MvcResult created = mockMvc.perform(post("/api/v1/items")
			.header("Authorization", "Bearer " + sellerToken)
			.contentType(MediaType.APPLICATION_JSON)
			.content("""
					{
					  "title": "%s",
					  "description": "24 inch monitor, works well.",
					  "categoryId": 2,
					  "priceCent": 26000,
					  "deliveryModes": ["SELF_PICKUP"],
					  "imageUrls": ["https://cdn.example.com/demand.png"]
					}
					""".formatted(title)))
			.andExpect(status().isOk())
			.andReturn();
		long itemId = read(created, "/data/id").asLong();
		String adminToken = loginAsAdmin("13800000093");
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
