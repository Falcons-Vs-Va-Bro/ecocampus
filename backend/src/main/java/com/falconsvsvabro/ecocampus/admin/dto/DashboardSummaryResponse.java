package com.falconsvsvabro.ecocampus.admin.dto;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

public record DashboardSummaryResponse(DashboardOverviewResponse overview, List<TrendPoint> dealTrends,
		List<RecentPendingItem> recentPendingItems, List<Reminder> reminders) {

	public record TrendPoint(LocalDate date, String label, long currentWeekCount, long previousWeekCount) {
	}

	public record RecentPendingItem(Long id, String title, String sellerNickname, String categoryName,
			OffsetDateTime submittedAt, String coverImageUrl) {
	}

	public record Reminder(String key, String label, long count, String severity) {
	}
}
