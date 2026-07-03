package com.falconsvsvabro.ecocampus.item.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AdminViolationRemoveRequest(@NotBlank @Size(max = 255) String reason) {
}
