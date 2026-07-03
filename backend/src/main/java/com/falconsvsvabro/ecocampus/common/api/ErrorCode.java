package com.falconsvsvabro.ecocampus.common.api;

import org.springframework.http.HttpStatus;

public enum ErrorCode {
	OK(HttpStatus.OK, "success"),
	BAD_REQUEST(HttpStatus.BAD_REQUEST, "bad request"),
	UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "unauthorized"),
	FORBIDDEN(HttpStatus.FORBIDDEN, "forbidden"),
	NOT_FOUND(HttpStatus.NOT_FOUND, "resource not found"),
	CONFLICT(HttpStatus.CONFLICT, "state conflict"),
	VALIDATION_FAILED(HttpStatus.UNPROCESSABLE_ENTITY, "validation failed"),
	BLACKLISTED(HttpStatus.LOCKED, "user is blacklisted"),
	INTERNAL_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "internal server error");

	private final HttpStatus httpStatus;
	private final String defaultMessage;

	ErrorCode(HttpStatus httpStatus, String defaultMessage) {
		this.httpStatus = httpStatus;
		this.defaultMessage = defaultMessage;
	}

	public HttpStatus httpStatus() {
		return httpStatus;
	}

	public String defaultMessage() {
		return defaultMessage;
	}
}
