package com.falconsvsvabro.ecocampus.category.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CategoryRequest(
		@NotBlank @Size(max = 40) String name,
		@Min(0) @Max(10000) int sort,
		Long parentId,
		Boolean enabled) {
}
