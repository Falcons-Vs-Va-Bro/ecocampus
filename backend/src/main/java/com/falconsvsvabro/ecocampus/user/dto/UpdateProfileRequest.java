package com.falconsvsvabro.ecocampus.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
		@NotBlank @Size(max = 40) String nickname,
		@Size(max = 500) String avatarUrl) {
}
