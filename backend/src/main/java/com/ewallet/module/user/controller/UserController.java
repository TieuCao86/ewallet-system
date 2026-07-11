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
        String email = userPrincipal.getUsername();
        return ApiResponse.success("Lấy thông tin tài khoản thành công", userService.getProfile(email));
    }

    @PutMapping("/profile")
    public ApiResponse<UserProfileResponse> updateProfile(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        String email = userPrincipal.getUsername();
        return ApiResponse.success("Cập nhật thông tin tài khoản thành công", userService.updateProfile(email, request));
    }

    @PostMapping("/pin")
    public ApiResponse<Void> createPin(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody CreatePinRequest request
    ) {
        String email = userPrincipal.getUsername();
        userService.createPin(email, request);
        return ApiResponse.success("Tạo mã PIN giao dịch thành công");
    }

    @PutMapping("/pin")
    public ApiResponse<Void> changePin(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody ChangePinRequest request
    ) {
        String email = userPrincipal.getUsername();
        userService.changePin(email, request);
        return ApiResponse.success("Thay đổi mã PIN giao dịch thành công");
    }

    @PutMapping("/password")
    public ApiResponse<Void> changePassword(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        String email = userPrincipal.getUsername();
        userService.changePassword(email, request);
        return ApiResponse.success("Thay đổi mật khẩu thành công");
    }
}