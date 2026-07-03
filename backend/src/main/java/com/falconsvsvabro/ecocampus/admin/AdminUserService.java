package com.falconsvsvabro.ecocampus.admin;

import com.falconsvsvabro.ecocampus.admin.dto.AdminUserResponse;
import com.falconsvsvabro.ecocampus.admin.dto.BlacklistUserRequest;
import com.falconsvsvabro.ecocampus.auth.CampusAccessGuard;
import com.falconsvsvabro.ecocampus.common.api.BusinessException;
import com.falconsvsvabro.ecocampus.common.api.ErrorCode;
import com.falconsvsvabro.ecocampus.common.api.PageResponse;
import com.falconsvsvabro.ecocampus.user.User;
import com.falconsvsvabro.ecocampus.user.UserRepository;
import com.falconsvsvabro.ecocampus.user.VerificationStatus;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminUserService {

	private final UserRepository userRepository;
	private final CampusAccessGuard campusAccessGuard;

	public AdminUserService(UserRepository userRepository, CampusAccessGuard campusAccessGuard) {
		this.userRepository = userRepository;
		this.campusAccessGuard = campusAccessGuard;
	}

	@Transactional(readOnly = true)
	public PageResponse<AdminUserResponse> listUsers(Long adminUserId, String keyword,
			VerificationStatus verificationStatus, int page, int size) {
		campusAccessGuard.requireAdmin(adminUserId);
		Pageable pageable = PageRequest.of(normalizePage(page) - 1, normalizeSize(size));
		var userPage = userRepository.searchAdminUsers(normalizeKeyword(keyword), verificationStatus, pageable);
		List<AdminUserResponse> items = userPage.getContent().stream().map(AdminUserResponse::from).toList();
		return new PageResponse<>(items, normalizePage(page), normalizeSize(size), userPage.getTotalElements());
	}

	@Transactional
	public AdminUserResponse blacklist(Long adminUserId, Long targetUserId, BlacklistUserRequest request) {
		User admin = campusAccessGuard.requireAdmin(adminUserId);
		if (admin.getId().equals(targetUserId)) {
			throw new BusinessException(ErrorCode.CONFLICT, "admin cannot blacklist self");
		}
		User user = getUser(targetUserId);
		user.blacklist(request.reason(), request.expireAt());
		return AdminUserResponse.from(user);
	}

	@Transactional
	public void removeBlacklist(Long adminUserId, Long targetUserId) {
		campusAccessGuard.requireAdmin(adminUserId);
		User user = getUser(targetUserId);
		user.removeBlacklist();
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
}
