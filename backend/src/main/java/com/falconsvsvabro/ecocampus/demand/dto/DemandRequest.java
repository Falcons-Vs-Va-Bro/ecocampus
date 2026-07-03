package com.falconsvsvabro.ecocampus.demand.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

public record DemandRequest(
		@NotBlank @Size(max = 80) String title,
		@NotBlank @Size(max = 1000) String description,
		@NotNull Long categoryId,
		@Min(0) Long budgetMinCent,
		@Min(0) Long budgetMaxCent,
		@NotEmpty @Size(max = 8) List<@NotBlank @Size(max = 40) String> keywords) {
}
