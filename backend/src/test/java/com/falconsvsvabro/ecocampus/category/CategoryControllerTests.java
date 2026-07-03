package com.falconsvsvabro.ecocampus.category;

import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
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
class CategoryControllerTests {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	@Autowired
	private JdbcTemplate jdbcTemplate;

	@Test
	void publicCategoryListReturnsSeededCampusCategories() throws Exception {
		mockMvc.perform(get("/api/v1/categories"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.data[*].name", hasItem("教材")))
			.andExpect(jsonPath("$.data[*].name", hasItem("数码")))
			.andExpect(jsonPath("$.data[*].name", hasItem("宿舍用品")))
			.andExpect(jsonPath("$.data[*].name", hasItem("运动器材")));
	}

	@Test
	void adminCanManageCategories() throws Exception {
		String accessToken = loginAsAdmin("13800000021");

		MvcResult created = mockMvc.perform(post("/api/v1/admin/categories")
			.header("Authorization", "Bearer " + accessToken)
			.contentType(MediaType.APPLICATION_JSON)
			.content("""
					{"name":"Musical Instruments","sort":50}
					"""))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.data.name").value("Musical Instruments"))
			.andReturn();

		long categoryId = read(created, "/data/id").asLong();

		mockMvc.perform(put("/api/v1/admin/categories/{categoryId}", categoryId)
			.header("Authorization", "Bearer " + accessToken)
			.contentType(MediaType.APPLICATION_JSON)
			.content("""
					{"name":"Instruments","sort":55}
					"""))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.data.name").value("Instruments"));

		mockMvc.perform(get("/api/v1/admin/categories").header("Authorization", "Bearer " + accessToken))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.data[*].name", hasItem("Instruments")));

		mockMvc.perform(delete("/api/v1/admin/categories/{categoryId}", categoryId)
			.header("Authorization", "Bearer " + accessToken))
			.andExpect(status().isOk());
	}

	@Test
	void regularUserCannotManageAdminCategories() throws Exception {
		String accessToken = login("13800000022");

		mockMvc.perform(post("/api/v1/admin/categories")
			.header("Authorization", "Bearer " + accessToken)
			.contentType(MediaType.APPLICATION_JSON)
			.content("""
					{"name":"Nope","sort":99}
					"""))
			.andExpect(status().isForbidden())
			.andExpect(jsonPath("$.code").value("FORBIDDEN"));
	}

	private String loginAsAdmin(String phone) throws Exception {
		String token = login(phone);
		jdbcTemplate.update("update users set role = 'ADMIN' where phone = ?", phone);
		return token;
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
