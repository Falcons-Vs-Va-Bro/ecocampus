package com.falconsvsvabro.ecocampus.category;

import com.falconsvsvabro.ecocampus.auth.CampusAccessGuard;
import com.falconsvsvabro.ecocampus.category.dto.CategoryRequest;
import com.falconsvsvabro.ecocampus.category.dto.CategoryResponse;
import com.falconsvsvabro.ecocampus.common.api.BusinessException;
import com.falconsvsvabro.ecocampus.common.api.ErrorCode;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CategoryService {

	private final CategoryRepository categoryRepository;
	private final CampusAccessGuard campusAccessGuard;

	public CategoryService(CategoryRepository categoryRepository, CampusAccessGuard campusAccessGuard) {
		this.categoryRepository = categoryRepository;
		this.campusAccessGuard = campusAccessGuard;
	}

	@Transactional(readOnly = true)
	public List<CategoryResponse> listPublicCategories() {
		return categoryRepository.findByOrderBySortAscIdAsc().stream().map(CategoryResponse::from).toList();
	}

	@Transactional(readOnly = true)
	public List<CategoryResponse> listAdminCategories(Long adminUserId) {
		campusAccessGuard.requireAdmin(adminUserId);
		return listPublicCategories();
	}

	@Transactional
	public CategoryResponse createCategory(Long adminUserId, CategoryRequest request) {
		campusAccessGuard.requireAdmin(adminUserId);
		ensureUniqueName(request.name(), 0L);
		Category category = new Category(request.name(), request.sort());
		return CategoryResponse.from(categoryRepository.save(category));
	}

	@Transactional
	public CategoryResponse updateCategory(Long adminUserId, Long categoryId, CategoryRequest request) {
		campusAccessGuard.requireAdmin(adminUserId);
		Category category = getCategory(categoryId);
		ensureUniqueName(request.name(), categoryId);
		category.update(request.name(), request.sort());
		return CategoryResponse.from(category);
	}

	@Transactional
	public void deleteCategory(Long adminUserId, Long categoryId) {
		campusAccessGuard.requireAdmin(adminUserId);
		Category category = getCategory(categoryId);
		categoryRepository.delete(category);
	}

	private Category getCategory(Long categoryId) {
		return categoryRepository.findById(categoryId)
			.orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "category not found"));
	}

	private void ensureUniqueName(String name, Long currentId) {
		if (categoryRepository.existsByNameAndIdNot(name, currentId)) {
			throw new BusinessException(ErrorCode.CONFLICT, "category name already exists");
		}
	}
}
