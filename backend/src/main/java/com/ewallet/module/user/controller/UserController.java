package com.ewallet.module.user.controller;

import com.ewallet.common.dto.ApiResponse;
import com.ewallet.module.user.dto.*;
import com.ewallet.module.user.entity.User;
import com.ewallet.module.user.service.UserService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getProfile(
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Profile retrieved successfully",
                        userService.getProfile(authentication.getName())
                )
        );
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileRequest request
    ) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Profile updated successfully",
                        userService.updateProfile(
                                getCurrentUser(authentication),
                                request
                        )
                )
        );
    }

    @PostMapping("/pin")
    public ResponseEntity<ApiResponse<Void>> createPin(
            Authentication authentication,
            @Valid @RequestBody CreatePinRequest request
    ) {

        userService.createPin(
                getCurrentUser(authentication),
                request
        );

        return ResponseEntity.ok(
                ApiResponse.success("PIN created successfully")
        );
    }

    @PutMapping("/pin")
    public ResponseEntity<ApiResponse<Void>> changePin(
            Authentication authentication,
            @Valid @RequestBody ChangePinRequest request
    ) {

        userService.changePin(
                getCurrentUser(authentication),
                request
        );

        return ResponseEntity.ok(
                ApiResponse.success("PIN changed successfully")
        );
    }

    @PutMapping("/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request
    ) {

        userService.changePassword(
                getCurrentUser(authentication),
                request
        );

        return ResponseEntity.ok(
                ApiResponse.success("Password changed successfully")
        );
    }

    private User getCurrentUser(Authentication authentication) {
        return userService.getByEmail(authentication.getName());
    }
}
