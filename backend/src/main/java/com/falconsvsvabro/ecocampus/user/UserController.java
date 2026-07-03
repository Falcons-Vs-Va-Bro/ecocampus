package com.falconsvsvabro.ecocampus.user;

import com.falconsvsvabro.ecocampus.auth.AuthenticatedUser;
import com.falconsvsvabro.ecocampus.auth.dto.MeResponse;
import com.falconsvsvabro.ecocampus.common.api.ApiResponse;
import com.falconsvsvabro.ecocampus.user.dto.AddressRequest;
import com.falconsvsvabro.ecocampus.user.dto.AddressResponse;
import com.falconsvsvabro.ecocampus.user.dto.UpdateProfileRequest;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users/me")
public class UserController {

	private final UserService userService;

	public UserController(UserService userService) {
		this.userService = userService;
	}

	@PutMapping
	ApiResponse<MeResponse> updateProfile(@AuthenticationPrincipal AuthenticatedUser currentUser,
			@Valid @RequestBody UpdateProfileRequest request, HttpServletRequest httpRequest) {
		return ApiResponse.ok(userService.updateProfile(currentUser.id(), request), traceId(httpRequest));
	}

	@GetMapping("/addresses")
	ApiResponse<List<AddressResponse>> listAddresses(@AuthenticationPrincipal AuthenticatedUser currentUser,
			HttpServletRequest httpRequest) {
		return ApiResponse.ok(userService.listAddresses(currentUser.id()), traceId(httpRequest));
	}

	@PostMapping("/addresses")
	ApiResponse<AddressResponse> createAddress(@AuthenticationPrincipal AuthenticatedUser currentUser,
			@Valid @RequestBody AddressRequest request, HttpServletRequest httpRequest) {
		return ApiResponse.ok(userService.createAddress(currentUser.id(), request), traceId(httpRequest));
	}

	@PutMapping("/addresses/{addressId}")
	ApiResponse<AddressResponse> updateAddress(@AuthenticationPrincipal AuthenticatedUser currentUser,
			@PathVariable Long addressId, @Valid @RequestBody AddressRequest request, HttpServletRequest httpRequest) {
		return ApiResponse.ok(userService.updateAddress(currentUser.id(), addressId, request), traceId(httpRequest));
	}

	@DeleteMapping("/addresses/{addressId}")
	ApiResponse<Void> deleteAddress(@AuthenticationPrincipal AuthenticatedUser currentUser, @PathVariable Long addressId,
			HttpServletRequest httpRequest) {
		userService.deleteAddress(currentUser.id(), addressId);
		return ApiResponse.ok(null, traceId(httpRequest));
	}

	private String traceId(HttpServletRequest request) {
		String traceId = request.getHeader("X-Trace-Id");
		if (traceId != null && !traceId.isBlank()) {
			return traceId;
		}
		return UUID.randomUUID().toString();
	}
}
