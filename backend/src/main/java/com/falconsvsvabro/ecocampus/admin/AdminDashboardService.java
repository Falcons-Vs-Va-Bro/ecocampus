package com.falconsvsvabro.ecocampus.admin;

import com.falconsvsvabro.ecocampus.admin.dto.DashboardOverviewResponse;
import com.falconsvsvabro.ecocampus.auth.CampusAccessGuard;
import com.falconsvsvabro.ecocampus.category.CategoryRepository;
import com.falconsvsvabro.ecocampus.item.ItemRepository;
import com.falconsvsvabro.ecocampus.item.ItemStatus;
import com.falconsvsvabro.ecocampus.order.OrderRepository;
import com.falconsvsvabro.ecocampus.order.OrderStatus;
import com.falconsvsvabro.ecocampus.user.UserRepository;
import com.falconsvsvabro.ecocampus.user.VerificationStatus;
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
}
