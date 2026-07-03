package com.falconsvsvabro.ecocampus.admin;

import com.falconsvsvabro.ecocampus.auth.AuthenticatedUser;
import com.falconsvsvabro.ecocampus.category.CategoryService;
import com.falconsvsvabro.ecocampus.category.dto.CategoryRequest;
import com.falconsvsvabro.ecocampus.category.dto.CategoryResponse;
import com.falconsvsvabro.ecocampus.common.api.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/categories")
public class AdminCategoryController {

	private final CategoryService categoryService;

	public AdminCategoryController(CategoryService categoryService) {
		this.categoryService = categoryService;
	}

	@GetMapping
	ApiResponse<List<CategoryResponse>> listCategories(@AuthenticationPrincipal AuthenticatedUser currentUser,
			HttpServletRequest request) {
		return ApiResponse.ok(categoryService.listAdminCategories(currentUser.id()), traceId(request));
	}

	@PostMapping
	ApiResponse<CategoryResponse> createCategory(@AuthenticationPrincipal AuthenticatedUser currentUser,
			@Valid @RequestBody CategoryRequest requestBody, HttpServletRequest request) {
		return ApiResponse.ok(categoryService.createCategory(currentUser.id(), requestBody), traceId(request));
	}

	@PutMapping("/{categoryId}")
	ApiResponse<CategoryResponse> updateCategory(@AuthenticationPrincipal AuthenticatedUser currentUser,
			@PathVariable Long categoryId, @Valid @RequestBody CategoryRequest requestBody, HttpServletRequest request) {
		return ApiResponse.ok(categoryService.updateCategory(currentUser.id(), categoryId, requestBody),
				traceId(request));
	}

	@DeleteMapping("/{categoryId}")
	ApiResponse<Void> deleteCategory(@AuthenticationPrincipal AuthenticatedUser currentUser,
			@PathVariable Long categoryId, HttpServletRequest request) {
		categoryService.deleteCategory(currentUser.id(), categoryId);
		return ApiResponse.ok(null, traceId(request));
	}

	private String traceId(HttpServletRequest request) {
		String traceId = request.getHeader("X-Trace-Id");
		if (traceId != null && !traceId.isBlank()) {
			return traceId;
		}
		return UUID.randomUUID().toString();
	}
}
