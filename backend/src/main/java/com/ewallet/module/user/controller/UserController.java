package com.ewallet.module.user.controller;

import com.ewallet.common.dto.ApiResponse;
import com.ewallet.module.user.dto.*;
import com.ewallet.module.user.service.UserService;
import com.ewallet.security.service.CurrentUserService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserService userService;
    private final CurrentUserService currentUserService;

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getProfile() {
        String email = currentUserService.getCurrentUser().getEmail();
        return ResponseEntity.ok(
                ApiResponse.success("Profile retrieved successfully", userService.getProfile(email))
        );
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        String email = currentUserService.getCurrentUser().getEmail();
        return ResponseEntity.ok(
                ApiResponse.success("Profile updated successfully", userService.updateProfile(email, request))
        );
    }

    @PostMapping("/pin")
    public ResponseEntity<ApiResponse<Void>> createPin(
            @Valid @RequestBody CreatePinRequest request
    ) {
        String email = currentUserService.getCurrentUser().getEmail();
        userService.createPin(email, request);
        return ResponseEntity.ok(ApiResponse.success("PIN created successfully"));
    }

    @PutMapping("/pin")
    public ResponseEntity<ApiResponse<Void>> changePin(
            @Valid @RequestBody ChangePinRequest request
    ) {
        String email = currentUserService.getCurrentUser().getEmail();
        userService.changePin(email, request);
        return ResponseEntity.ok(ApiResponse.success("PIN changed successfully"));
    }

    @PutMapping("/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        String email = currentUserService.getCurrentUser().getEmail();
        userService.changePassword(email, request);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully"));
    }
}