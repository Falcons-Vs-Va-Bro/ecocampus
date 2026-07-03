package com.falconsvsvabro.ecocampus.health;

import com.falconsvsvabro.ecocampus.common.api.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import java.time.OffsetDateTime;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/health")
public class HealthController {

	@GetMapping
	ApiResponse<HealthPayload> health(HttpServletRequest request) {
		return ApiResponse.ok(new HealthPayload("UP", "ecocampus", OffsetDateTime.now()), traceId(request));
	}

	private String traceId(HttpServletRequest request) {
		String traceId = request.getHeader("X-Trace-Id");
		if (traceId != null && !traceId.isBlank()) {
			return traceId;
		}
		return UUID.randomUUID().toString();
	}

	record HealthPayload(String status, String service, OffsetDateTime timestamp) {
	}
}
