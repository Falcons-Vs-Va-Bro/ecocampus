package com.falconsvsvabro.ecocampus.category.dto;

import com.falconsvsvabro.ecocampus.category.Category;

public record CategoryResponse(Long id, String name, int sort, Long parentId, boolean enabled, long itemCount) {

	public static CategoryResponse from(Category category, long itemCount) {
		return new CategoryResponse(category.getId(), category.getName(), category.getSort(), category.getParentId(),
				category.isEnabled(), itemCount);
	}
}
