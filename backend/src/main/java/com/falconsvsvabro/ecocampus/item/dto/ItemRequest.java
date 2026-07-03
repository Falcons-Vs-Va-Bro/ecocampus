package com.falconsvsvabro.ecocampus.item.dto;

import com.falconsvsvabro.ecocampus.item.DeliveryMode;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.Set;

public record ItemRequest(
		@NotBlank @Size(max = 80) String title,
		@NotBlank @Size(max = 2000) String description,
		@NotNull Long categoryId,
		@Min(0) long priceCent,
		@NotEmpty Set<DeliveryMode> deliveryModes,
		@NotEmpty @Size(max = 9) List<@NotBlank @Size(max = 500) String> imageUrls) {
}
