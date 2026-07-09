package com.ewallet.module.kyc.controller;

import com.ewallet.common.dto.ApiResponse;
import com.ewallet.module.kyc.dto.KycRequest;
import com.ewallet.module.kyc.dto.KycResponse;
import com.ewallet.module.kyc.service.KycService;
import com.ewallet.security.principal.UserPrincipal;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/kyc")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class KycController {

    private final KycService kycService;

    @GetMapping
    public ApiResponse<KycResponse> get(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        Long userId = userPrincipal.getUser().getId();
        return ApiResponse.success("KYC data retrieved successfully", kycService.getKyc(userId));
    }


    @PostMapping
    public ApiResponse<KycResponse> submit(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody KycRequest request
    ) {
        Long userId = userPrincipal.getUser().getId();
        return ApiResponse.success("KYC submitted successfully", kycService.submitKyc(userId, request));
    }
}