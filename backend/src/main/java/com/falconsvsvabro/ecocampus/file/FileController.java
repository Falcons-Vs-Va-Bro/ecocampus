package com.falconsvsvabro.ecocampus.file;

import com.falconsvsvabro.ecocampus.auth.AuthenticatedUser;
import com.falconsvsvabro.ecocampus.auth.CampusAccessGuard;
import com.falconsvsvabro.ecocampus.common.api.ApiResponse;
import com.falconsvsvabro.ecocampus.file.dto.ImageUploadResponse;
import jakarta.servlet.http.HttpServletRequest;
import java.util.UUID;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/files")
public class FileController {

	private final LocalImageStorageService imageStorageService;
	private final CampusAccessGuard campusAccessGuard;

	public FileController(LocalImageStorageService imageStorageService, CampusAccessGuard campusAccessGuard) {
		this.imageStorageService = imageStorageService;
		this.campusAccessGuard = campusAccessGuard;
	}

	@PostMapping(value = "/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	ApiResponse<ImageUploadResponse> uploadImage(@AuthenticationPrincipal AuthenticatedUser currentUser,
			@RequestParam MultipartFile file, @RequestParam FileScene scene, HttpServletRequest request) {
		campusAccessGuard.requireVerifiedUser(currentUser.id());
		return ApiResponse.ok(imageStorageService.store(file, scene), traceId(request));
	}

	private String traceId(HttpServletRequest request) {
		String traceId = request.getHeader("X-Trace-Id");
		if (traceId != null && !traceId.isBlank()) {
			return traceId;
		}
		return UUID.randomUUID().toString();
	}
}
