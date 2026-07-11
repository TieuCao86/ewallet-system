package com.ewallet.module.otp.controller;

import com.ewallet.common.dto.ApiResponse;
import com.ewallet.module.otp.dto.SendOtpRequest;
import com.ewallet.module.otp.dto.VerifyOtpRequest;
import com.ewallet.module.otp.service.OtpService;
import com.ewallet.security.principal.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.apache.coyote.BadRequestException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/otp")
@RequiredArgsConstructor
public class OtpController {

    private final OtpService otpService;

    @PostMapping("/send")
    public ApiResponse<Void> sendOtp(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody SendOtpRequest request
    ) {

        otpService.sendOtp(
                userPrincipal.getUser().getId(),
                request.getType()
        );

        return ApiResponse.success("OTP sent successfully");
    }

    @PostMapping("/verify")
    public ApiResponse<Boolean> verifyOtp(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody VerifyOtpRequest request
    ) {

        boolean result = otpService.verifyOtp(
                userPrincipal.getUser().getId(),
                request.getOtp(),
                request.getType()
        );

        return ApiResponse.success("OTP verified successfully", result);
    }

}