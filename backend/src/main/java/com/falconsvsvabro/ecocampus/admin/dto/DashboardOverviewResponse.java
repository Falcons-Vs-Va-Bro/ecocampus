package com.falconsvsvabro.ecocampus.admin.dto;

import java.util.List;

public record DashboardOverviewResponse(long itemPublishCount, long orderCompletedCount, long pendingReviewCount,
		long activeUserCount, List<CategoryStat> categoryStats) {

	public record CategoryStat(String categoryName, long itemCount, long completedOrderCount) {
	}
}
