package com.falconsvsvabro.ecocampus.common.api;

public record ApiResponse<T>(String code, String message, T data, String traceId) {

	public static <T> ApiResponse<T> ok(T data, String traceId) {
		return new ApiResponse<>(ErrorCode.OK.name(), ErrorCode.OK.defaultMessage(), data, traceId);
	}

	public static <T> ApiResponse<T> error(ErrorCode errorCode, String message, T data, String traceId) {
		String resolvedMessage = message == null || message.isBlank() ? errorCode.defaultMessage() : message;
		return new ApiResponse<>(errorCode.name(), resolvedMessage, data, traceId);
	}
}
