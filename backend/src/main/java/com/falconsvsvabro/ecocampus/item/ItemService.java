package com.falconsvsvabro.ecocampus.item;

import com.falconsvsvabro.ecocampus.auth.CampusAccessGuard;
import com.falconsvsvabro.ecocampus.category.Category;
import com.falconsvsvabro.ecocampus.category.CategoryRepository;
import com.falconsvsvabro.ecocampus.common.api.BusinessException;
import com.falconsvsvabro.ecocampus.common.api.ErrorCode;
import com.falconsvsvabro.ecocampus.common.api.PageResponse;
import com.falconsvsvabro.ecocampus.favorite.FavoriteRepository;
import com.falconsvsvabro.ecocampus.item.dto.ItemDetailResponse;
import com.falconsvsvabro.ecocampus.item.dto.ItemRequest;
import com.falconsvsvabro.ecocampus.item.dto.MyItemResponse;
import com.falconsvsvabro.ecocampus.item.dto.AdminItemResponse;
import com.falconsvsvabro.ecocampus.item.dto.AdminItemReviewRequest;
import com.falconsvsvabro.ecocampus.item.dto.PublicItemDetailResponse;
import com.falconsvsvabro.ecocampus.item.dto.PublicItemListResponse;
import com.falconsvsvabro.ecocampus.user.User;
import com.falconsvsvabro.ecocampus.user.UserRepository;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ItemService {

	private final ItemRepository itemRepository;
	private final CategoryRepository categoryRepository;
	private final AuditLogRepository auditLogRepository;
	private final CampusAccessGuard campusAccessGuard;
	private final UserRepository userRepository;
	private final FavoriteRepository favoriteRepository;

	public ItemService(ItemRepository itemRepository, CategoryRepository categoryRepository,
			AuditLogRepository auditLogRepository, CampusAccessGuard campusAccessGuard, UserRepository userRepository,
			FavoriteRepository favoriteRepository) {
		this.itemRepository = itemRepository;
		this.categoryRepository = categoryRepository;
		this.auditLogRepository = auditLogRepository;
		this.campusAccessGuard = campusAccessGuard;
		this.userRepository = userRepository;
		this.favoriteRepository = favoriteRepository;
	}

	@Transactional
	public ItemDetailResponse createItem(Long userId, ItemRequest request) {
		User seller = campusAccessGuard.requireVerifiedUser(userId);
		Category category = getEnabledCategory(request.categoryId());
		Item item = new Item(seller.getId(), request.title(), request.description(), request.categoryId(),
				request.priceCent(), request.deliveryModes(), request.imageUrls());
		Item saved = itemRepository.save(item);
		writeAudit(seller.getId(), saved.getId(), "ITEM_CREATED", "created pending review item");
		return ItemDetailResponse.from(saved, category.getName());
	}

	@Transactional
	public ItemDetailResponse updateItem(Long userId, Long itemId, ItemRequest request) {
		User seller = campusAccessGuard.requireVerifiedUser(userId);
		Item item = getOwnedItem(seller.getId(), itemId);
		if (!item.isEditableBySeller()) {
			throw new BusinessException(ErrorCode.CONFLICT, "item cannot be edited in current status");
		}
		Category category = getEnabledCategory(request.categoryId());
		item.updateContent(request.title(), request.description(), request.categoryId(), request.priceCent(),
				request.deliveryModes(), request.imageUrls());
		writeAudit(seller.getId(), item.getId(), "ITEM_UPDATED", "seller updated item content");
		return ItemDetailResponse.from(item, category.getName());
	}

	@Transactional
	public ItemDetailResponse requestOnSale(Long userId, Long itemId) {
		User seller = campusAccessGuard.requireVerifiedUser(userId);
		Item item = getOwnedItem(seller.getId(), itemId);
		try {
			item.requestOnSaleReview();
		}
		catch (IllegalStateException exception) {
			throw new BusinessException(ErrorCode.CONFLICT, exception.getMessage());
		}
		writeAudit(seller.getId(), item.getId(), "ITEM_ON_SALE_REQUESTED", "seller requested review for on-sale");
		return ItemDetailResponse.from(item, getCategory(item.getCategoryId()).getName());
	}

	@Transactional
	public ItemDetailResponse offShelf(Long userId, Long itemId) {
		User seller = campusAccessGuard.requireVerifiedUser(userId);
		Item item = getOwnedItem(seller.getId(), itemId);
		try {
			item.offShelf();
		}
		catch (IllegalStateException exception) {
			throw new BusinessException(ErrorCode.CONFLICT, exception.getMessage());
		}
		writeAudit(seller.getId(), item.getId(), "ITEM_OFF_SHELF", "seller off-shelved item");
		return ItemDetailResponse.from(item, getCategory(item.getCategoryId()).getName());
	}

	@Transactional(readOnly = true)
	public PageResponse<MyItemResponse> listMyItems(Long userId, ItemStatus status, int page, int size) {
		User seller = campusAccessGuard.requireVerifiedUser(userId);
		Pageable pageable = PageRequest.of(normalizePage(page) - 1, normalizeSize(size));
		var itemPage = itemRepository.findSellerItems(seller.getId(), status, pageable);
		List<MyItemResponse> items = itemPage.getContent()
			.stream()
			.map(item -> MyItemResponse.from(item, getCategory(item.getCategoryId()).getName()))
			.toList();
		return new PageResponse<>(items, normalizePage(page), normalizeSize(size), itemPage.getTotalElements());
	}

	@Transactional(readOnly = true)
	public ItemDetailResponse getMyItem(Long userId, Long itemId) {
		User seller = campusAccessGuard.requireVerifiedUser(userId);
		Item item = itemRepository.findById(itemId)
			.orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "item not found"));
		if (!item.getSellerId().equals(seller.getId())) {
			throw new BusinessException(ErrorCode.FORBIDDEN, "item does not belong to current user");
		}
		return ItemDetailResponse.from(item, getCategory(item.getCategoryId()).getName());
	}

	@Transactional(readOnly = true)
	public PageResponse<PublicItemListResponse> searchPublicItems(String keyword, Long categoryId, Long minPriceCent,
			Long maxPriceCent, DeliveryMode deliveryMode, Long viewerUserId, int page, int size) {
		Pageable pageable = PageRequest.of(normalizePage(page) - 1, normalizeSize(size));
		var itemPage = itemRepository.searchPublicItems(normalizeKeyword(keyword), categoryId, minPriceCent,
				maxPriceCent, deliveryMode, pageable);
		List<PublicItemListResponse> items = itemPage.getContent()
			.stream()
			.map(item -> toPublicItemListResponse(item, viewerUserId))
			.toList();
		return new PageResponse<>(items, normalizePage(page), normalizeSize(size), itemPage.getTotalElements());
	}

	@Transactional(readOnly = true)
	public PublicItemDetailResponse getPublicItemDetail(Long itemId, Long viewerUserId) {
		Item item = itemRepository.findById(itemId)
			.orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "item not found"));
		if (item.getStatus() != ItemStatus.ON_SALE) {
			throw new BusinessException(ErrorCode.NOT_FOUND, "item not found");
		}
		User seller = getUser(item.getSellerId());
		boolean favorited = viewerUserId != null && favoriteRepository.existsByUserIdAndItemId(viewerUserId, itemId);
		return PublicItemDetailResponse.from(item, getCategory(item.getCategoryId()).getName(), seller, favorited,
				favoriteRepository.countByItemId(itemId));
	}

	@Transactional(readOnly = true)
	public PageResponse<AdminItemResponse> listAdminReviewItems(Long adminUserId, ItemStatus status, int page,
			int size) {
		campusAccessGuard.requireAdmin(adminUserId);
		return listAdminItemsInternal(status, null, null, page, size);
	}

	@Transactional(readOnly = true)
	public PageResponse<AdminItemResponse> listAdminItems(Long adminUserId, ItemStatus status, String keyword,
			Long categoryId, int page, int size) {
		campusAccessGuard.requireAdmin(adminUserId);
		return listAdminItemsInternal(status, keyword, categoryId, page, size);
	}

	@Transactional
	public AdminItemResponse reviewItem(Long adminUserId, Long itemId, AdminItemReviewRequest request) {
		User admin = campusAccessGuard.requireAdmin(adminUserId);
		Item item = itemRepository.findByIdForUpdate(itemId)
			.orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "item not found"));
		try {
			item.review(Boolean.TRUE.equals(request.approved()));
		}
		catch (IllegalStateException exception) {
			throw new BusinessException(ErrorCode.CONFLICT, exception.getMessage());
		}
		writeAudit(admin.getId(), item.getId(), Boolean.TRUE.equals(request.approved()) ? "ITEM_REVIEW_APPROVED"
				: "ITEM_REVIEW_REJECTED", request.reason());
		return toAdminItemResponse(item);
	}

	@Transactional
	public AdminItemResponse violationRemove(Long adminUserId, Long itemId, String reason) {
		User admin = campusAccessGuard.requireAdmin(adminUserId);
		Item item = itemRepository.findByIdForUpdate(itemId)
			.orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "item not found"));
		try {
			item.violationRemove();
		}
		catch (IllegalStateException exception) {
			throw new BusinessException(ErrorCode.CONFLICT, exception.getMessage());
		}
		writeAudit(admin.getId(), item.getId(), "ITEM_VIOLATION_REMOVED", reason);
		return toAdminItemResponse(item);
	}

	private PageResponse<AdminItemResponse> listAdminItemsInternal(ItemStatus status, String keyword, Long categoryId,
			int page, int size) {
		Pageable pageable = PageRequest.of(normalizePage(page) - 1, normalizeSize(size));
		var itemPage = itemRepository.searchAdminItems(status, normalizeKeyword(keyword), categoryId, pageable);
		List<AdminItemResponse> items = itemPage.getContent().stream().map(this::toAdminItemResponse).toList();
		return new PageResponse<>(items, normalizePage(page), normalizeSize(size), itemPage.getTotalElements());
	}

	private AdminItemResponse toAdminItemResponse(Item item) {
		return AdminItemResponse.from(item, getUser(item.getSellerId()), getCategory(item.getCategoryId()).getName());
	}

	private PublicItemListResponse toPublicItemListResponse(Item item, Long viewerUserId) {
		boolean favorited = viewerUserId != null && favoriteRepository.existsByUserIdAndItemId(viewerUserId,
				item.getId());
		return PublicItemListResponse.from(item, getCategory(item.getCategoryId()).getName(), getUser(item.getSellerId()),
				favorited, favoriteRepository.countByItemId(item.getId()));
	}

	private Item getOwnedItem(Long sellerId, Long itemId) {
		Item item = itemRepository.findByIdForUpdate(itemId)
			.orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "item not found"));
		if (!item.getSellerId().equals(sellerId)) {
			throw new BusinessException(ErrorCode.FORBIDDEN, "item does not belong to current user");
		}
		return item;
	}

	private Category getCategory(Long categoryId) {
		return categoryRepository.findById(categoryId)
			.orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "category not found"));
	}

	private Category getEnabledCategory(Long categoryId) {
		Category category = getCategory(categoryId);
		if (!category.isEnabled()) {
			throw new BusinessException(ErrorCode.CONFLICT, "category is disabled");
		}
		if (category.getParentId() != null && !getCategory(category.getParentId()).isEnabled()) {
			throw new BusinessException(ErrorCode.CONFLICT, "parent category is disabled");
		}
		return category;
	}

	private User getUser(Long userId) {
		return userRepository.findById(userId)
			.orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "user not found"));
	}

	private String normalizeKeyword(String keyword) {
		if (keyword == null || keyword.isBlank()) {
			return null;
		}
		return keyword.trim();
	}

	private int normalizePage(int page) {
		return Math.max(page, 1);
	}

	private int normalizeSize(int size) {
		if (size < 1) {
			return 20;
		}
		return Math.min(size, 100);
	}

	private void writeAudit(Long actorUserId, Long itemId, String action, String remark) {
		auditLogRepository.save(new AuditLog(actorUserId, "ITEM", itemId, action, remark));
	}
}
