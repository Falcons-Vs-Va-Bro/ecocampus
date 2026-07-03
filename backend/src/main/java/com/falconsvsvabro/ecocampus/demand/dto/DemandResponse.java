package com.falconsvsvabro.ecocampus.demand.dto;

import com.falconsvsvabro.ecocampus.demand.Demand;
import com.falconsvsvabro.ecocampus.demand.DemandStatus;
import java.time.OffsetDateTime;
import java.util.List;

public record DemandResponse(Long id, String title, String description, Long categoryId, String categoryName,
		Long budgetMinCent, Long budgetMaxCent, List<String> keywords, DemandStatus status, OffsetDateTime createdAt) {

	public static DemandResponse from(Demand demand, String categoryName) {
		return new DemandResponse(demand.getId(), demand.getTitle(), demand.getDescription(), demand.getCategoryId(),
				categoryName, demand.getBudgetMinCent(), demand.getBudgetMaxCent(), demand.getKeywords(),
				demand.getStatus(), demand.getCreatedAt());
	}
}
