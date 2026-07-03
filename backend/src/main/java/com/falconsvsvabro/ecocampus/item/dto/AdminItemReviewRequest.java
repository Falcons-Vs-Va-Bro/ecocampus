package com.falconsvsvabro.ecocampus.item.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AdminItemReviewRequest(@NotNull Boolean approved, @Size(max = 255) String reason) {
}
