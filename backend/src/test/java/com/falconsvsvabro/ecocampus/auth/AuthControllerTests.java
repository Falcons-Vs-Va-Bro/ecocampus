package com.falconsvsvabro.ecocampus.auth;

import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.emptyOrNullString;
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
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerTests {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	@Test
	void loginThenVerifyCampusIdentityAndReadMe() throws Exception {
		String phone = "229202400000";


		MvcResult login = mockMvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON)
			.content("""
					{"account":"%s","password":"test-password"}
					""".formatted(phone)))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.data.user.verificationStatus").value("VERIFIED"))
			.andExpect(jsonPath("$.data.accessToken", not(emptyOrNullString())))
			.andReturn();

		String accessToken = read(login, "/data/accessToken").asText();

		mockMvc.perform(post("/api/v1/auth/campus-verification")
			.header("Authorization", "Bearer " + accessToken)
			.contentType(MediaType.APPLICATION_JSON)
			.content("""
					{
					  "realName": "Zhang San",
					  "studentNo": "2026000001",
					  "college": "Information School",
					  "grade": "2026"
					}
					"""))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.data.verificationStatus").value("VERIFIED"))
			.andExpect(jsonPath("$.data.studentNoMasked").value("2026****001"));

		mockMvc.perform(get("/api/v1/auth/me").header("Authorization", "Bearer " + accessToken))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.data.phone").value("229****0000"))
			.andExpect(jsonPath("$.data.verificationStatus").value("VERIFIED"));
	}

	@Test
	void meRequiresBearerToken() throws Exception {
		mockMvc.perform(get("/api/v1/auth/me"))
			.andExpect(status().isUnauthorized())
			.andExpect(jsonPath("$.code").value("UNAUTHORIZED"));
	}

	@Test
	void existingAccountRequiresTheOriginalPasswordAndIsNotDuplicated() throws Exception {
		String account = "229202499999";
		MvcResult firstLogin = login(account, "first-password");
		long firstUserId = read(firstLogin, "/data/user/id").asLong();

		MvcResult secondLogin = login(account, "first-password");
		org.assertj.core.api.Assertions.assertThat(read(secondLogin, "/data/user/id").asLong()).isEqualTo(firstUserId);

		mockMvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON)
			.content("""
					{"account":"%s","password":"wrong-password"}
					""".formatted(account)))
			.andExpect(status().isUnauthorized())
			.andExpect(jsonPath("$.code").value("UNAUTHORIZED"));
	}

	private MvcResult login(String account, String password) throws Exception {
		return mockMvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON)
			.content("""
					{"account":"%s","password":"%s"}
					""".formatted(account, password)))
			.andExpect(status().isOk())
			.andReturn();
	}

	private JsonNode read(MvcResult result, String pointer) throws Exception {
		return objectMapper.readTree(result.getResponse().getContentAsString()).at(pointer);
	}
}
