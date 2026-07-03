package com.falconsvsvabro.ecocampus.common.api;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(BusinessException.class)
	ResponseEntity<ApiResponse<Void>> handleBusinessException(BusinessException exception, HttpServletRequest request) {
		ErrorCode errorCode = exception.getErrorCode();
		return ResponseEntity.status(errorCode.httpStatus())
			.body(ApiResponse.error(errorCode, exception.getMessage(), null, traceId(request)));
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	ResponseEntity<ApiResponse<Map<String, Object>>> handleMethodArgumentNotValid(
			MethodArgumentNotValidException exception, HttpServletRequest request) {
		List<Map<String, String>> errors = exception.getBindingResult()
			.getFieldErrors()
			.stream()
			.map(this::toValidationError)
			.toList();
		return ResponseEntity.status(ErrorCode.VALIDATION_FAILED.httpStatus())
			.body(ApiResponse.error(ErrorCode.VALIDATION_FAILED, null, Map.of("errors", errors), traceId(request)));
	}

	@ExceptionHandler(ConstraintViolationException.class)
	ResponseEntity<ApiResponse<Map<String, Object>>> handleConstraintViolation(
			ConstraintViolationException exception, HttpServletRequest request) {
		List<Map<String, String>> errors = exception.getConstraintViolations()
			.stream()
			.map(violation -> Map.of("field", violation.getPropertyPath().toString(), "message",
					violation.getMessage()))
			.toList();
		return ResponseEntity.status(ErrorCode.VALIDATION_FAILED.httpStatus())
			.body(ApiResponse.error(ErrorCode.VALIDATION_FAILED, null, Map.of("errors", errors), traceId(request)));
	}

	@ExceptionHandler(Exception.class)
	ResponseEntity<ApiResponse<Void>> handleException(Exception exception, HttpServletRequest request) {
		return ResponseEntity.status(ErrorCode.INTERNAL_ERROR.httpStatus())
			.body(ApiResponse.error(ErrorCode.INTERNAL_ERROR, exception.getMessage(), null, traceId(request)));
	}

	private Map<String, String> toValidationError(FieldError fieldError) {
		return Map.of("field", fieldError.getField(), "message",
				fieldError.getDefaultMessage() == null ? "invalid value" : fieldError.getDefaultMessage());
	}

	private String traceId(HttpServletRequest request) {
		String traceId = request.getHeader("X-Trace-Id");
		if (traceId != null && !traceId.isBlank()) {
			return traceId;
		}
		return UUID.randomUUID().toString();
	}
}
