package com.falconsvsvabro.ecocampus.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record SendSmsCodeRequest(@NotBlank @Pattern(regexp = "1\\d{10}") String phone) {
}
