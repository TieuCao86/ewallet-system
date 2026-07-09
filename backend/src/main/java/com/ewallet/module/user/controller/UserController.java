package com.ewallet.module.user.controller;

import com.ewallet.common.dto.ApiResponse;
import com.ewallet.module.user.dto.*;
import com.ewallet.module.user.service.UserService;
import com.ewallet.security.principal.UserPrincipal;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public ApiResponse<UserProfileResponse> getProfile(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        String email = userPrincipal.getUser().getEmail();
        return ApiResponse.success("Profile retrieved successfully", userService.getProfile(email));
    }

    @PutMapping("/profile")
    public ApiResponse<UserProfileResponse> updateProfile(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        String email = userPrincipal.getUser().getEmail();
        return ApiResponse.success("Profile updated successfully", userService.updateProfile(email, request));
    }


    @PostMapping("/pin")
    public ApiResponse<Void> createPin(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody CreatePinRequest request
    ) {
        String email = userPrincipal.getUser().getEmail();
        userService.createPin(email, request);
        return ApiResponse.success("PIN created successfully");
    }

    @PutMapping("/pin")
    public ApiResponse<Void> changePin(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody ChangePinRequest request
    ) {
        String email = userPrincipal.getUser().getEmail();
        userService.changePin(email, request);
        return ApiResponse.success("PIN changed successfully");
    }

    @PutMapping("/password")
    public ApiResponse<Void> changePassword(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        String email = userPrincipal.getUser().getEmail();
        userService.changePassword(email, request);
        return ApiResponse.success("Password changed successfully");
    }
}