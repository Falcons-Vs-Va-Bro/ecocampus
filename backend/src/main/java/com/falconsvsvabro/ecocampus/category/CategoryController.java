package com.falconsvsvabro.ecocampus.category;

import com.falconsvsvabro.ecocampus.category.dto.CategoryResponse;
import com.falconsvsvabro.ecocampus.common.api.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/categories")
public class CategoryController {

	private final CategoryService categoryService;

	public CategoryController(CategoryService categoryService) {
		this.categoryService = categoryService;
	}

	@GetMapping
	ApiResponse<List<CategoryResponse>> listCategories(HttpServletRequest request) {
		return ApiResponse.ok(categoryService.listPublicCategories(), traceId(request));
	}

	private String traceId(HttpServletRequest request) {
		String traceId = request.getHeader("X-Trace-Id");
		if (traceId != null && !traceId.isBlank()) {
			return traceId;
		}
		return UUID.randomUUID().toString();
	}
}
