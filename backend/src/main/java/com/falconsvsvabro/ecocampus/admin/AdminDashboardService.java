package com.falconsvsvabro.ecocampus.admin;

import com.falconsvsvabro.ecocampus.admin.dto.DashboardOverviewResponse;
import com.falconsvsvabro.ecocampus.admin.dto.DashboardSummaryResponse;
import com.falconsvsvabro.ecocampus.auth.CampusAccessGuard;
import com.falconsvsvabro.ecocampus.category.Category;
import com.falconsvsvabro.ecocampus.category.CategoryRepository;
import com.falconsvsvabro.ecocampus.common.api.BusinessException;
import com.falconsvsvabro.ecocampus.common.api.ErrorCode;
import com.falconsvsvabro.ecocampus.item.Item;
import com.falconsvsvabro.ecocampus.item.ItemRepository;
import com.falconsvsvabro.ecocampus.item.ItemStatus;
import com.falconsvsvabro.ecocampus.order.OrderRepository;
import com.falconsvsvabro.ecocampus.order.OrderStatus;
import com.falconsvsvabro.ecocampus.user.User;
import com.falconsvsvabro.ecocampus.user.UserRepository;
import com.falconsvsvabro.ecocampus.user.VerificationStatus;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminDashboardService {

	private final CampusAccessGuard campusAccessGuard;
	private final ItemRepository itemRepository;
	private final OrderRepository orderRepository;
	private final UserRepository userRepository;
	private final CategoryRepository categoryRepository;

	public AdminDashboardService(CampusAccessGuard campusAccessGuard, ItemRepository itemRepository,
			OrderRepository orderRepository, UserRepository userRepository, CategoryRepository categoryRepository) {
		this.campusAccessGuard = campusAccessGuard;
		this.itemRepository = itemRepository;
		this.orderRepository = orderRepository;
		this.userRepository = userRepository;
		this.categoryRepository = categoryRepository;
	}

	@Transactional(readOnly = true)
	public DashboardOverviewResponse overview(Long adminUserId) {
		campusAccessGuard.requireAdmin(adminUserId);
		return buildOverview();
	}

	@Transactional(readOnly = true)
	public DashboardSummaryResponse summary(Long adminUserId) {
		campusAccessGuard.requireAdmin(adminUserId);
		DashboardOverviewResponse overview = buildOverview();
		return new DashboardSummaryResponse(overview, buildDealTrends(), buildRecentPendingItems(),
				buildReminders(overview));
	}

	private DashboardOverviewResponse buildOverview() {
		List<DashboardOverviewResponse.CategoryStat> categoryStats = categoryRepository.findByOrderBySortAscIdAsc()
			.stream()
			.map(category -> new DashboardOverviewResponse.CategoryStat(category.getName(),
					itemRepository.countByCategoryIdAndStatusNot(category.getId(), ItemStatus.DELETED),
					orderRepository.countCompletedOrdersByCategoryId(category.getId())))
			.toList();
		return new DashboardOverviewResponse(itemRepository.countByStatusNot(ItemStatus.DELETED),
				orderRepository.countByStatus(OrderStatus.COMPLETED), itemRepository.countByStatus(ItemStatus.PENDING_REVIEW),
				userRepository.countByVerificationStatus(VerificationStatus.VERIFIED), categoryStats);
	}

	private List<DashboardSummaryResponse.TrendPoint> buildDealTrends() {
		ZoneId zoneId = ZoneId.systemDefault();
		LocalDate today = LocalDate.now(zoneId);
		LocalDate weekStart = today.minusDays(6);
		String[] labels = { "周一", "周二", "周三", "周四", "周五", "周六", "周日" };

		return java.util.stream.IntStream.range(0, 7)
			.mapToObj(index -> {
				LocalDate date = weekStart.plusDays(index);
				LocalDate previousDate = date.minusDays(7);
				return new DashboardSummaryResponse.TrendPoint(date, labels[date.getDayOfWeek().getValue() - 1],
						countCompletedOrdersOn(date, zoneId), countCompletedOrdersOn(previousDate, zoneId));
			})
			.toList();
	}

	private long countCompletedOrdersOn(LocalDate date, ZoneId zoneId) {
		OffsetDateTime start = date.atStartOfDay(zoneId).toOffsetDateTime();
		OffsetDateTime end = date.plusDays(1).atStartOfDay(zoneId).toOffsetDateTime();
		return orderRepository.countByStatusAndCreatedAtBetween(OrderStatus.COMPLETED, start, end);
	}

	private List<DashboardSummaryResponse.RecentPendingItem> buildRecentPendingItems() {
		return itemRepository.findTop3ByStatusOrderByCreatedAtDesc(ItemStatus.PENDING_REVIEW)
			.stream()
			.map(item -> {
				User seller = getUser(item.getSellerId());
				Category category = getCategory(item.getCategoryId());
				String coverImageUrl = item.getImageUrls().isEmpty() ? null : item.getImageUrls().getFirst();
				return new DashboardSummaryResponse.RecentPendingItem(item.getId(), item.getTitle(), seller.getNickname(),
						category.getName(), item.getCreatedAt(), coverImageUrl);
			})
			.toList();
	}

	private List<DashboardSummaryResponse.Reminder> buildReminders(DashboardOverviewResponse overview) {
		return List.of(
				new DashboardSummaryResponse.Reminder("pendingReview", "件商品待审核", overview.pendingReviewCount(),
						overview.pendingReviewCount() > 0 ? "danger" : "normal"),
				new DashboardSummaryResponse.Reminder("violationRemoved", "件违规下架商品需复核",
						itemRepository.countByStatus(ItemStatus.VIOLATION_REMOVED), "warning"),
				new DashboardSummaryResponse.Reminder("categoryRequest", "个类目申请待确认", 0, "normal"));
	}

	private User getUser(Long userId) {
		return userRepository.findById(userId)
			.orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "user not found"));
	}

	private Category getCategory(Long categoryId) {
		return categoryRepository.findById(categoryId)
			.orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "category not found"));
	}
}
