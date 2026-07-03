package com.falconsvsvabro.ecocampus.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.OffsetDateTime;

public record BlacklistUserRequest(@NotBlank @Size(max = 255) String reason, OffsetDateTime expireAt) {
}
