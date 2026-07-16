package com.falconsvsvabro.ecocampus.item.dto;

import com.falconsvsvabro.ecocampus.item.Item;
import com.falconsvsvabro.ecocampus.item.ItemStatus;
import com.falconsvsvabro.ecocampus.user.User;
import java.time.OffsetDateTime;

public record AdminItemResponse(Long id, String title, String description, Long sellerId, String sellerNickname,
		String studentNoMasked, String categoryName, long priceCent, ItemStatus status, String coverImageUrl,
		int imageCount, OffsetDateTime createdAt) {

	public static AdminItemResponse from(Item item, User seller, String categoryName) {
		String coverImageUrl = item.getImageUrls().isEmpty() ? null : item.getImageUrls().getFirst();
		return new AdminItemResponse(item.getId(), item.getTitle(), item.getDescription(), seller.getId(),
				seller.getNickname(), maskStudentNo(seller.getStudentNo()), categoryName, item.getPriceCent(),
				item.getStatus(), coverImageUrl, item.getImageUrls().size(), item.getCreatedAt());
	}

	private static String maskStudentNo(String studentNo) {
		if (studentNo == null || studentNo.length() < 8) {
			return null;
		}
		return studentNo.substring(0, 4) + "****" + studentNo.substring(studentNo.length() - 3);
	}
}
