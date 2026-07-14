package com.falconsvsvabro.ecocampus.auth;

import com.falconsvsvabro.ecocampus.common.api.BusinessException;
import com.falconsvsvabro.ecocampus.common.api.ErrorCode;
import com.falconsvsvabro.ecocampus.user.User;
import com.falconsvsvabro.ecocampus.user.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

	private final JwtService jwtService;
	private final UserRepository userRepository;
	private final SecurityErrorWriter securityErrorWriter;

	public JwtAuthenticationFilter(JwtService jwtService, UserRepository userRepository,
			SecurityErrorWriter securityErrorWriter) {
		this.jwtService = jwtService;
		this.userRepository = userRepository;
		this.securityErrorWriter = securityErrorWriter;
	}

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {
		String authorization = request.getHeader("Authorization");
		if (authorization == null || !authorization.startsWith("Bearer ")) {
			filterChain.doFilter(request, response);
			return;
		}

		try {
			String token = authorization.substring("Bearer ".length()).trim();
			Long userId = jwtService.parseAccessUserId(token);
			User user = userRepository.findById(userId)
				.orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED, "current user not found"));
			AuthenticatedUser principal = new AuthenticatedUser(user.getId(), user.getRole(),
					user.getVerificationStatus());
			List<SimpleGrantedAuthority> authorities = List
				.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
			UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(principal,
					null, authorities);
			SecurityContextHolder.getContext().setAuthentication(authentication);
			filterChain.doFilter(request, response);
		}
		catch (BusinessException exception) {
			SecurityContextHolder.clearContext();
			if (isPublicItemRead(request)) {
				filterChain.doFilter(request, response);
				return;
			}
			securityErrorWriter.write(request, response, exception.getErrorCode(), exception.getMessage());
		}
	}

	private boolean isPublicItemRead(HttpServletRequest request) {
		if (!HttpMethod.GET.matches(request.getMethod())) {
			return false;
		}

		String requestUri = request.getRequestURI();
		return requestUri.equals("/api/v1/items") || requestUri.matches("/api/v1/items/[^/]+");
	}
}
