package com.falconsvsvabro.ecocampus.auth;

import com.falconsvsvabro.ecocampus.common.api.ErrorCode;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

@Component
public class JsonAccessDeniedHandler implements AccessDeniedHandler {

	private final SecurityErrorWriter securityErrorWriter;

	public JsonAccessDeniedHandler(SecurityErrorWriter securityErrorWriter) {
		this.securityErrorWriter = securityErrorWriter;
	}

	@Override
	public void handle(HttpServletRequest request, HttpServletResponse response,
			AccessDeniedException accessDeniedException) throws IOException {
		securityErrorWriter.write(request, response, ErrorCode.FORBIDDEN, ErrorCode.FORBIDDEN.defaultMessage());
	}
}
