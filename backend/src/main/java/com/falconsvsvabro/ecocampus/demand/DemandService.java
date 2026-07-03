package com.falconsvsvabro.ecocampus.demand;

import com.falconsvsvabro.ecocampus.auth.CampusAccessGuard;
import com.falconsvsvabro.ecocampus.category.Category;
import com.falconsvsvabro.ecocampus.category.CategoryRepository;
import com.falconsvsvabro.ecocampus.common.api.BusinessException;
import com.falconsvsvabro.ecocampus.common.api.ErrorCode;
import com.falconsvsvabro.ecocampus.common.api.PageResponse;
import com.falconsvsvabro.ecocampus.demand.dto.DemandMatchResponse;
import com.falconsvsvabro.ecocampus.demand.dto.DemandRequest;
import com.falconsvsvabro.ecocampus.demand.dto.DemandResponse;
import com.falconsvsvabro.ecocampus.item.Item;
import com.falconsvsvabro.ecocampus.item.ItemRepository;
import com.falconsvsvabro.ecocampus.user.User;
import java.util.List;
import java.util.Locale;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DemandService {

	private final DemandRepository demandRepository;
	private final CategoryRepository categoryRepository;
	private final ItemRepository itemRepository;
	private final CampusAccessGuard campusAccessGuard;

	public DemandService(DemandRepository demandRepository, CategoryRepository categoryRepository,
			ItemRepository itemRepository, CampusAccessGuard campusAccessGuard) {
		this.demandRepository = demandRepository;
		this.categoryRepository = categoryRepository;
		this.itemRepository = itemRepository;
		this.campusAccessGuard = campusAccessGuard;
	}

	@Transactional
	public DemandResponse createDemand(Long userId, DemandRequest request) {
		User user = campusAccessGuard.requireVerifiedUser(userId);
		Category category = getCategory(request.categoryId());
		validateBudget(request.budgetMinCent(), request.budgetMaxCent());
		Demand demand = new Demand(user.getId(), request.title(), request.description(), request.categoryId(),
				request.budgetMinCent(), request.budgetMaxCent(), normalizeKeywords(request.keywords()));
		return DemandResponse.from(demandRepository.save(demand), category.getName());
	}

	@Transactional(readOnly = true)
	public PageResponse<DemandResponse> searchDemands(Long categoryId, String keyword, int page, int size) {
		Pageable pageable = PageRequest.of(normalizePage(page) - 1, normalizeSize(size));
		var demandPage = demandRepository.searchOpenDemands(categoryId, normalizeKeyword(keyword), pageable);
		List<DemandResponse> items = demandPage.getContent().stream().map(this::toResponse).toList();
		return new PageResponse<>(items, normalizePage(page), normalizeSize(size), demandPage.getTotalElements());
	}

	@Transactional(readOnly = true)
	public PageResponse<DemandResponse> listMyDemands(Long userId, int page, int size) {
		User user = campusAccessGuard.requireVerifiedUser(userId);
		Pageable pageable = PageRequest.of(normalizePage(page) - 1, normalizeSize(size));
		var demandPage = demandRepository.findByUserId(user.getId(), pageable);
		List<DemandResponse> items = demandPage.getContent().stream().map(this::toResponse).toList();
		return new PageResponse<>(items, normalizePage(page), normalizeSize(size), demandPage.getTotalElements());
	}

	@Transactional
	public DemandResponse closeDemand(Long userId, Long demandId) {
		User user = campusAccessGuard.requireVerifiedUser(userId);
		Demand demand = getDemand(demandId);
		if (!demand.getUserId().equals(user.getId())) {
			throw new BusinessException(ErrorCode.FORBIDDEN, "demand does not belong to current user");
		}
		try {
			demand.close();
		}
		catch (IllegalStateException exception) {
			throw new BusinessException(ErrorCode.CONFLICT, exception.getMessage());
		}
		return toResponse(demand);
	}

	@Transactional(readOnly = true)
	public List<DemandMatchResponse> matchDemand(Long userId, Long demandId) {
		User user = campusAccessGuard.requireVerifiedUser(userId);
		Demand demand = getDemand(demandId);
		if (!demand.getUserId().equals(user.getId())) {
			throw new BusinessException(ErrorCode.FORBIDDEN, "demand does not belong to current user");
		}
		return itemRepository.findOnSaleCandidatesForDemand(demand.getCategoryId(), demand.getBudgetMinCent(),
				demand.getBudgetMaxCent())
			.stream()
			.filter(item -> keywordMatches(demand, item))
			.map(item -> new DemandMatchResponse(item.getId(), item.getTitle(), item.getPriceCent(),
					"keyword and budget matched"))
			.toList();
	}

	private DemandResponse toResponse(Demand demand) {
		return DemandResponse.from(demand, getCategory(demand.getCategoryId()).getName());
	}

	private Demand getDemand(Long demandId) {
		return demandRepository.findById(demandId)
			.orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "demand not found"));
	}

	private Category getCategory(Long categoryId) {
		return categoryRepository.findById(categoryId)
			.orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "category not found"));
	}

	private boolean keywordMatches(Demand demand, Item item) {
		String haystack = (item.getTitle() + " " + item.getDescription()).toLowerCase(Locale.ROOT);
		return demand.getKeywords()
			.stream()
			.map(keyword -> keyword.toLowerCase(Locale.ROOT))
			.anyMatch(haystack::contains);
	}

	private void validateBudget(Long budgetMinCent, Long budgetMaxCent) {
		if (budgetMinCent != null && budgetMaxCent != null && budgetMinCent > budgetMaxCent) {
			throw new BusinessException(ErrorCode.BAD_REQUEST, "budget min cannot exceed max");
		}
	}

	private List<String> normalizeKeywords(List<String> keywords) {
		return keywords.stream().map(String::trim).filter(keyword -> !keyword.isBlank()).distinct().toList();
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
}
