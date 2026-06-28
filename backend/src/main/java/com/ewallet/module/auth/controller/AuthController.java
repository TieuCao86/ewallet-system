package com.ewallet.module.auth.controller;

import com.ewallet.common.dto.ApiResponse;
import com.ewallet.module.auth.dto.LoginRequest;
import com.ewallet.module.auth.dto.LoginResponse;
import com.ewallet.module.auth.service.AuthService;
import com.ewallet.module.user.dto.RegisterRequest;
import com.ewallet.module.user.dto.UserProfileResponse;
import com.ewallet.module.user.entity.User;
import com.ewallet.module.user.service.UserService;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserProfileResponse>> register(
            @Valid @RequestBody RegisterRequest request
    ) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Register successfully",
                        userService.register(request)
                )
        );
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request,
            HttpServletResponse response){

        String token = authService.login(request);

        ResponseCookie cookie = ResponseCookie
                .from("access_token", token)
                .httpOnly(true)
                .secure(false) // true khi deploy
                .sameSite("Lax")
                .path("/")
                .maxAge(Duration.ofDays(1))
                .build();

        response.addHeader(
                HttpHeaders.SET_COOKIE,
                cookie.toString()
        );

        return ResponseEntity.ok(
                ApiResponse.success("Login successfully")
        );
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(
            HttpServletResponse response) {

        ResponseCookie cookie =
                ResponseCookie.from("access_token", "")
                        .httpOnly(true)
                        .secure(false)
                        .sameSite("Lax")
                        .path("/")
                        .maxAge(0)
                        .build();

        response.addHeader(
                HttpHeaders.SET_COOKIE,
                cookie.toString()
        );

        return ResponseEntity.ok(
                ApiResponse.success("Logout successfully")
        );
    }
}
