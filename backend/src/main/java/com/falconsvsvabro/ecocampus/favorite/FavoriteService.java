package com.falconsvsvabro.ecocampus.favorite;

import com.falconsvsvabro.ecocampus.auth.CampusAccessGuard;
import com.falconsvsvabro.ecocampus.category.CategoryRepository;
import com.falconsvsvabro.ecocampus.common.api.BusinessException;
import com.falconsvsvabro.ecocampus.common.api.ErrorCode;
import com.falconsvsvabro.ecocampus.common.api.PageResponse;
import com.falconsvsvabro.ecocampus.item.Item;
import com.falconsvsvabro.ecocampus.item.ItemRepository;
import com.falconsvsvabro.ecocampus.item.ItemStatus;
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
public class FavoriteService {

	private final FavoriteRepository favoriteRepository;
	private final ItemRepository itemRepository;
	private final CategoryRepository categoryRepository;
	private final UserRepository userRepository;
	private final CampusAccessGuard campusAccessGuard;

	public FavoriteService(FavoriteRepository favoriteRepository, ItemRepository itemRepository,
			CategoryRepository categoryRepository, UserRepository userRepository, CampusAccessGuard campusAccessGuard) {
		this.favoriteRepository = favoriteRepository;
		this.itemRepository = itemRepository;
		this.categoryRepository = categoryRepository;
		this.userRepository = userRepository;
		this.campusAccessGuard = campusAccessGuard;
	}

	@Transactional
	public PublicItemDetailResponse favorite(Long userId, Long itemId) {
		User user = campusAccessGuard.requireVerifiedUser(userId);
		Item item = getOnSaleItem(itemId);
		if (item.getSellerId().equals(user.getId())) {
			throw new BusinessException(ErrorCode.CONFLICT, "cannot favorite own item");
		}
		if (favoriteRepository.existsByUserIdAndItemId(user.getId(), item.getId())) {
			throw new BusinessException(ErrorCode.CONFLICT, "item already favorited");
		}
		favoriteRepository.save(new Favorite(user.getId(), item.getId()));
		return toDetail(item, user.getId());
	}

	@Transactional
	public void unfavorite(Long userId, Long itemId) {
		User user = campusAccessGuard.requireVerifiedUser(userId);
		Favorite favorite = favoriteRepository.findByUserIdAndItemId(user.getId(), itemId)
			.orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "favorite not found"));
		favoriteRepository.delete(favorite);
	}

	@Transactional(readOnly = true)
	public PageResponse<PublicItemListResponse> listMyFavorites(Long userId, int page, int size) {
		User user = campusAccessGuard.requireVerifiedUser(userId);
		Pageable pageable = PageRequest.of(normalizePage(page) - 1, normalizeSize(size));
		var itemPage = favoriteRepository.findFavoriteItems(user.getId(), pageable);
		List<PublicItemListResponse> items = itemPage.getContent()
			.stream()
			.map(item -> PublicItemListResponse.from(item, getCategoryName(item.getCategoryId())))
			.toList();
		return new PageResponse<>(items, normalizePage(page), normalizeSize(size), itemPage.getTotalElements());
	}

	private PublicItemDetailResponse toDetail(Item item, Long viewerUserId) {
		User seller = userRepository.findById(item.getSellerId())
			.orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "user not found"));
		boolean favorited = favoriteRepository.existsByUserIdAndItemId(viewerUserId, item.getId());
		long favoriteCount = favoriteRepository.countByItemId(item.getId());
		return PublicItemDetailResponse.from(item, getCategoryName(item.getCategoryId()), seller, favorited,
				favoriteCount);
	}

	private Item getOnSaleItem(Long itemId) {
		Item item = itemRepository.findById(itemId)
			.orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "item not found"));
		if (item.getStatus() != ItemStatus.ON_SALE) {
			throw new BusinessException(ErrorCode.NOT_FOUND, "item not found");
		}
		return item;
	}

	private String getCategoryName(Long categoryId) {
		return categoryRepository.findById(categoryId)
			.orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "category not found"))
			.getName();
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
}
