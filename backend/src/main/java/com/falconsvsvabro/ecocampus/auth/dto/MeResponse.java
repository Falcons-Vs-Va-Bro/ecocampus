package com.falconsvsvabro.ecocampus.auth.dto;

import com.falconsvsvabro.ecocampus.user.UserRole;
import com.falconsvsvabro.ecocampus.user.User;
import com.falconsvsvabro.ecocampus.user.VerificationStatus;

public record MeResponse(Long id, String nickname, String phone, UserRole role, VerificationStatus verificationStatus,
		String studentNoMasked, String avatarUrl, String realName, String college, String grade) {

	public static MeResponse from(User user) {
		String displayPhone = user.getMobilePhone() == null ? user.getPhone() : user.getMobilePhone();
		return new MeResponse(user.getId(), user.getNickname(), maskPhone(displayPhone), user.getRole(),
				user.getVerificationStatus(), maskStudentNo(user.getStudentNo()), user.getAvatarUrl(), user.getRealName(),
				user.getCollege(), user.getGrade());
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
