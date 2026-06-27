package com.ewallet.module.user.controller;

import com.ewallet.module.user.dto.ChangePinRequest;
import com.ewallet.module.user.dto.CreatePinRequest;
import com.ewallet.module.user.dto.UserProfileResponse;
import com.ewallet.module.user.entity.User;
import com.ewallet.module.user.service.UserService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public UserProfileResponse getProfile(
            Authentication authentication) {

        User user =
                userService.getByEmail(authentication.getName());

        return UserProfileResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .status(user.getStatus().name())
                .kycStatus(user.getKycStatus().name())
                .build();
    }

    @PostMapping("/pin")
    public String createPin(
            Authentication authentication,
            @RequestBody CreatePinRequest request
    ) {

        User user = userService.getByEmail(
                authentication.getName()
        );

        userService.createPin(user, request);

        return "PIN created successfully";
    }

    @PutMapping("/pin")
    public String changePin(
            Authentication authentication,
            @RequestBody ChangePinRequest request
    ) {

        User user = userService.getByEmail(
                authentication.getName()
        );

        userService.changePin(user, request);

        return "PIN changed successfully";
    }
}
