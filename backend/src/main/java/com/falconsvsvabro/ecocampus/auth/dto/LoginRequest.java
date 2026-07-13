package com.falconsvsvabro.ecocampus.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record LoginRequest(
		@NotBlank @Size(max = 20) @Pattern(regexp = "2292024.+") String account,
		@NotBlank @Size(max = 72) String password) {
}
