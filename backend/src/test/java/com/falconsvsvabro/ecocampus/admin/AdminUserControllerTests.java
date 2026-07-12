package com.falconsvsvabro.ecocampus.admin;

import static org.hamcrest.Matchers.hasItem;
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
class AdminUserControllerTests {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	@Autowired
	private JdbcTemplate jdbcTemplate;

	@Test
	void adminCanBlacklistAndRestoreUser() throws Exception {
		AuthSession user = loginAndVerify("229202400101", "2026000101");
		AuthSession admin = loginAsAdmin("229202400102");

		mockMvc.perform(get("/api/v1/admin/users")
			.header("Authorization", "Bearer " + admin.token())
			.param("keyword", "0101")
			.param("verificationStatus", "VERIFIED"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.data.items[*].id", hasItem((int) user.userId())));

		mockMvc.perform(post("/api/v1/admin/users/{userId}/blacklist", user.userId())
			.header("Authorization", "Bearer " + admin.token())
			.contentType(MediaType.APPLICATION_JSON)
			.content("""
					{"reason":"suspected off-campus merchant","expireAt":null}
					"""))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.data.verificationStatus").value("BLACKLISTED"))
			.andExpect(jsonPath("$.data.blacklisted").value(true));

		mockMvc.perform(post("/api/v1/items")
			.header("Authorization", "Bearer " + user.token())
			.contentType(MediaType.APPLICATION_JSON)
			.content("""
					{
					  "title": "Blocked Item",
					  "description": "Should not be created.",
					  "categoryId": 1,
					  "priceCent": 1000,
					  "deliveryModes": ["SELF_PICKUP"],
					  "imageUrls": ["https://cdn.example.com/blocked.png"]
					}
					"""))
			.andExpect(status().isLocked())
			.andExpect(jsonPath("$.code").value("BLACKLISTED"));

		mockMvc.perform(delete("/api/v1/admin/users/{userId}/blacklist", user.userId())
			.header("Authorization", "Bearer " + admin.token()))
			.andExpect(status().isOk());

		mockMvc.perform(post("/api/v1/items")
			.header("Authorization", "Bearer " + user.token())
			.contentType(MediaType.APPLICATION_JSON)
			.content("""
					{
					  "title": "Restored Item",
					  "description": "Allowed after restore.",
					  "categoryId": 1,
					  "priceCent": 1000,
					  "deliveryModes": ["SELF_PICKUP"],
					  "imageUrls": ["https://cdn.example.com/restored.png"]
					}
					"""))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.data.status").value("PENDING_REVIEW"));
	}

	private AuthSession loginAsAdmin(String phone) throws Exception {
		AuthSession session = login(phone);
		jdbcTemplate.update("update users set role = 'ADMIN' where phone = ?", phone);
		return session;
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
