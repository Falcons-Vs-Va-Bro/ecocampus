package com.falconsvsvabro.ecocampus.admin.dto;

import com.falconsvsvabro.ecocampus.user.User;
import com.falconsvsvabro.ecocampus.user.UserRole;
import com.falconsvsvabro.ecocampus.user.VerificationStatus;

public record AdminUserResponse(Long id, String nickname, String phoneMasked, String studentNoMasked, UserRole role,
		VerificationStatus verificationStatus, boolean blacklisted) {

	public static AdminUserResponse from(User user) {
		String displayPhone = user.getMobilePhone() == null ? user.getPhone() : user.getMobilePhone();
		return new AdminUserResponse(user.getId(), user.getNickname(), maskPhone(displayPhone),
				maskStudentNo(user.getStudentNo()), user.getRole(), user.getVerificationStatus(),
				user.getVerificationStatus() == VerificationStatus.BLACKLISTED);
	}

	private static String maskPhone(String phone) {
		if (phone == null || phone.length() < 7) {
			return "****";
		}
		return phone.substring(0, 3) + "****" + phone.substring(phone.length() - 4);
	}

	private static String maskStudentNo(String studentNo) {
		if (studentNo == null || studentNo.length() < 8) {
			return null;
		}
		return studentNo.substring(0, 4) + "****" + studentNo.substring(studentNo.length() - 3);
	}
}
