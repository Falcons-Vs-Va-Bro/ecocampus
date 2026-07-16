package com.falconsvsvabro.ecocampus.category;

import com.falconsvsvabro.ecocampus.auth.CampusAccessGuard;
import com.falconsvsvabro.ecocampus.category.dto.CategoryRequest;
import com.falconsvsvabro.ecocampus.category.dto.CategoryResponse;
import com.falconsvsvabro.ecocampus.common.api.BusinessException;
import com.falconsvsvabro.ecocampus.common.api.ErrorCode;
import com.falconsvsvabro.ecocampus.item.ItemRepository;
import com.falconsvsvabro.ecocampus.item.ItemStatus;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CategoryService {

	private final CategoryRepository categoryRepository;
	private final CampusAccessGuard campusAccessGuard;
	private final ItemRepository itemRepository;

	public CategoryService(CategoryRepository categoryRepository, CampusAccessGuard campusAccessGuard,
			ItemRepository itemRepository) {
		this.categoryRepository = categoryRepository;
		this.campusAccessGuard = campusAccessGuard;
		this.itemRepository = itemRepository;
	}

	@Transactional(readOnly = true)
	public List<CategoryResponse> listPublicCategories() {
		List<Category> categories = categoryRepository.findByOrderBySortAscIdAsc();
		Map<Long, Long> itemCounts = itemCounts(categories);
		return categories.stream()
			.filter(Category::isEnabled)
			.filter(category -> category.getParentId() == null || categories.stream()
				.anyMatch(parent -> parent.getId().equals(category.getParentId()) && parent.isEnabled()))
			.map(category -> CategoryResponse.from(category, itemCounts.getOrDefault(category.getId(), 0L)))
			.toList();
	}

	@Transactional(readOnly = true)
	public List<CategoryResponse> listAdminCategories(Long adminUserId) {
		campusAccessGuard.requireAdmin(adminUserId);
		List<Category> categories = categoryRepository.findByOrderBySortAscIdAsc();
		Map<Long, Long> itemCounts = itemCounts(categories);
		return categories.stream()
			.map(category -> CategoryResponse.from(category, itemCounts.getOrDefault(category.getId(), 0L)))
			.toList();
	}

	@Transactional
	public CategoryResponse createCategory(Long adminUserId, CategoryRequest request) {
		campusAccessGuard.requireAdmin(adminUserId);
		ensureUniqueName(request.name(), 0L);
		Long parentId = validateParent(request.parentId(), null);
		Category category = new Category(request.name(), request.sort(), parentId,
				request.enabled() == null || request.enabled());
		return toResponse(categoryRepository.save(category));
	}

	@Transactional
	public CategoryResponse updateCategory(Long adminUserId, Long categoryId, CategoryRequest request) {
		campusAccessGuard.requireAdmin(adminUserId);
		Category category = getCategory(categoryId);
		ensureUniqueName(request.name(), categoryId);
		Long parentId = validateParent(request.parentId(), categoryId);
		if (parentId != null && categoryRepository.existsByParentId(categoryId)) {
			throw new BusinessException(ErrorCode.CONFLICT, "category with children cannot become a child");
		}
		boolean enabled = request.enabled() == null ? category.isEnabled() : request.enabled();
		category.update(request.name(), request.sort(), parentId, enabled);
		return toResponse(category);
	}

	@Transactional
	public void deleteCategory(Long adminUserId, Long categoryId) {
		campusAccessGuard.requireAdmin(adminUserId);
		Category category = getCategory(categoryId);
		if (categoryRepository.existsByParentId(categoryId)) {
			throw new BusinessException(ErrorCode.CONFLICT, "category with children cannot be deleted");
		}
		if (itemRepository.countByCategoryIdAndStatusNot(categoryId, ItemStatus.DELETED) > 0) {
			throw new BusinessException(ErrorCode.CONFLICT, "category with items cannot be deleted");
		}
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

	private Long validateParent(Long parentId, Long currentId) {
		if (parentId == null) {
			return null;
		}
		if (parentId.equals(currentId)) {
			throw new BusinessException(ErrorCode.BAD_REQUEST, "category cannot be its own parent");
		}
		Category parent = getCategory(parentId);
		if (parent.getParentId() != null) {
			throw new BusinessException(ErrorCode.BAD_REQUEST, "category hierarchy supports two levels only");
		}
		return parent.getId();
	}

	private CategoryResponse toResponse(Category category) {
		long itemCount = itemRepository.countByCategoryIdAndStatusNot(category.getId(), ItemStatus.DELETED);
		return CategoryResponse.from(category, itemCount);
	}

	private Map<Long, Long> itemCounts(List<Category> categories) {
		Map<Long, Long> directCounts = itemRepository.countNonDeletedItemsByCategory()
			.stream()
			.collect(Collectors.toMap(ItemRepository.CategoryItemCount::getCategoryId,
					ItemRepository.CategoryItemCount::getItemCount));
		return categories.stream().collect(Collectors.toMap(Category::getId, category -> {
			long direct = directCounts.getOrDefault(category.getId(), 0L);
			if (category.getParentId() != null) {
				return direct;
			}
			return direct + categories.stream()
				.filter(child -> category.getId().equals(child.getParentId()))
				.mapToLong(child -> directCounts.getOrDefault(child.getId(), 0L))
				.sum();
		}));
	}
}
