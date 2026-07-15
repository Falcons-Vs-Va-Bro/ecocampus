package com.falconsvsvabro.ecocampus.file;

import static org.hamcrest.Matchers.startsWith;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import javax.imageio.ImageIO;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest(properties = "ecocampus.file-storage.local-dir=./target/test-uploads")
@AutoConfigureMockMvc
class FileControllerTests {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	@Test
	void verifiedUserCanUploadImage() throws Exception {
		String accessToken = loginAndVerify("229202400071", "2026000071");
		MockMultipartFile file = new MockMultipartFile("file", "item.png", "image/png", pngBytes(2, 3));

		mockMvc.perform(multipart("/api/v1/files/images")
			.file(file)
			.param("scene", "ITEM")
			.header("Authorization", "Bearer " + accessToken))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.data.url", startsWith("/uploads/ITEM/")))
			.andExpect(jsonPath("$.data.width").value(2))
			.andExpect(jsonPath("$.data.height").value(3));
	}

	@Test
	void uploadedImageIsPublicAndCacheable() throws Exception {
		String accessToken = loginAndVerify("229202400073", "2026000073");
		MockMultipartFile file = new MockMultipartFile("file", "item.png", "image/png", pngBytes(2, 3));
		MvcResult upload = mockMvc.perform(multipart("/api/v1/files/images")
			.file(file)
			.param("scene", "ITEM")
			.header("Authorization", "Bearer " + accessToken))
			.andExpect(status().isOk())
			.andReturn();

		String imageUrl = read(upload, "/data/url").asText();
		mockMvc.perform(get(imageUrl))
			.andExpect(status().isOk())
			.andExpect(header().string("Cache-Control", containsString("max-age=31536000")))
			.andExpect(header().string("Cache-Control", containsString("public")))
			.andExpect(header().string("Cache-Control", containsString("immutable")));
	}

	@Test
	void rejectsNonImageUpload() throws Exception {
		String accessToken = loginAndVerify("229202400072", "2026000072");
		MockMultipartFile file = new MockMultipartFile("file", "note.txt", MediaType.TEXT_PLAIN_VALUE,
				"not image".getBytes());

		mockMvc.perform(multipart("/api/v1/files/images")
			.file(file)
			.param("scene", "ITEM")
			.header("Authorization", "Bearer " + accessToken))
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.code").value("BAD_REQUEST"));
	}

	private byte[] pngBytes(int width, int height) throws Exception {
		BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
		ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
		ImageIO.write(image, "png", outputStream);
		return outputStream.toByteArray();
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
