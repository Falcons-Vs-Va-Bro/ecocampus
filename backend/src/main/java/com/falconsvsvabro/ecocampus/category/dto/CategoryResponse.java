package com.falconsvsvabro.ecocampus.category.dto;

import com.falconsvsvabro.ecocampus.category.Category;

public record CategoryResponse(Long id, String name, int sort) {

	public static CategoryResponse from(Category category) {
		return new CategoryResponse(category.getId(), category.getName(), category.getSort());
	}
}
