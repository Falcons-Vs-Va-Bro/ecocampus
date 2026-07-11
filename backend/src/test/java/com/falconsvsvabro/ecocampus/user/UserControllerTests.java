package com.falconsvsvabro.ecocampus.user;

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
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
class UserControllerTests {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	@Test
	void updateProfileAndManageAddresses() throws Exception {
		String accessToken = loginAndVerify("229202400011", "2026000011");

		mockMvc.perform(put("/api/v1/users/me")
			.header("Authorization", "Bearer " + accessToken)
			.contentType(MediaType.APPLICATION_JSON)
			.content("""
					{"nickname":"Eco Student","avatarUrl":"https://cdn.example.com/avatar.png"}
					"""))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.data.nickname").value("Eco Student"));

		MvcResult created = mockMvc.perform(post("/api/v1/users/me/addresses")
			.header("Authorization", "Bearer " + accessToken)
			.contentType(MediaType.APPLICATION_JSON)
			.content("""
					{
					  "receiverName": "Zhang San",
					  "receiverPhone": "13800000011",
					  "campusArea": "Main Campus",
					  "detail": "Dorm 1 gate",
					  "isDefault": true
					}
					"""))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.data.isDefault").value(true))
			.andReturn();

		long addressId = read(created, "/data/id").asLong();

		mockMvc.perform(get("/api/v1/users/me/addresses").header("Authorization", "Bearer " + accessToken))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.data[0].detail").value("Dorm 1 gate"));

		mockMvc.perform(put("/api/v1/users/me/addresses/{addressId}", addressId)
			.header("Authorization", "Bearer " + accessToken)
			.contentType(MediaType.APPLICATION_JSON)
			.content("""
					{
					  "receiverName": "Zhang San",
					  "receiverPhone": "13800000011",
					  "campusArea": "East Campus",
					  "detail": "Library entrance",
					  "isDefault": true
					}
					"""))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.data.campusArea").value("East Campus"));

		mockMvc.perform(delete("/api/v1/users/me/addresses/{addressId}", addressId)
			.header("Authorization", "Bearer " + accessToken))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.code").value("OK"));

		mockMvc.perform(get("/api/v1/users/me/addresses").header("Authorization", "Bearer " + accessToken))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.data").isEmpty());
	}

	@Test
	void unverifiedUsersCannotManageAddresses() throws Exception {
		String accessToken = login("229202400012");

		mockMvc.perform(get("/api/v1/users/me/addresses").header("Authorization", "Bearer " + accessToken))
			.andExpect(status().isForbidden())
			.andExpect(jsonPath("$.code").value("FORBIDDEN"));
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
