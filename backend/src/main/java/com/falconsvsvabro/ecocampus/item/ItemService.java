package com.falconsvsvabro.ecocampus.item;

import com.falconsvsvabro.ecocampus.auth.CampusAccessGuard;
import com.falconsvsvabro.ecocampus.category.Category;
import com.falconsvsvabro.ecocampus.category.CategoryRepository;
import com.falconsvsvabro.ecocampus.common.api.BusinessException;
import com.falconsvsvabro.ecocampus.common.api.ErrorCode;
import com.falconsvsvabro.ecocampus.common.api.PageResponse;
import com.falconsvsvabro.ecocampus.item.dto.ItemDetailResponse;
import com.falconsvsvabro.ecocampus.item.dto.ItemRequest;
import com.falconsvsvabro.ecocampus.item.dto.MyItemResponse;
import com.falconsvsvabro.ecocampus.user.User;
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

	public ItemService(ItemRepository itemRepository, CategoryRepository categoryRepository,
			AuditLogRepository auditLogRepository, CampusAccessGuard campusAccessGuard) {
		this.itemRepository = itemRepository;
		this.categoryRepository = categoryRepository;
		this.auditLogRepository = auditLogRepository;
		this.campusAccessGuard = campusAccessGuard;
	}

	@Transactional
	public ItemDetailResponse createItem(Long userId, ItemRequest request) {
		User seller = campusAccessGuard.requireVerifiedUser(userId);
		Category category = getCategory(request.categoryId());
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
		Category category = getCategory(request.categoryId());
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

	private Item getOwnedItem(Long sellerId, Long itemId) {
		Item item = itemRepository.findById(itemId)
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
