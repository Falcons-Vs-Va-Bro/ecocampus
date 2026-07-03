package com.falconsvsvabro.ecocampus.auth.dto;

import com.falconsvsvabro.ecocampus.user.UserRole;
import com.falconsvsvabro.ecocampus.user.User;
import com.falconsvsvabro.ecocampus.user.VerificationStatus;

public record MeResponse(Long id, String nickname, String phone, UserRole role, VerificationStatus verificationStatus,
		String studentNoMasked) {

	public static MeResponse from(User user) {
		return new MeResponse(user.getId(), user.getNickname(), maskPhone(user.getPhone()), user.getRole(),
				user.getVerificationStatus(), maskStudentNo(user.getStudentNo()));
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
