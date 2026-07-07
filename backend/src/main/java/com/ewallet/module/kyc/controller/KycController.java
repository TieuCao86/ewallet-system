package com.ewallet.module.kyc.controller;

import com.ewallet.common.dto.ApiResponse;
import com.ewallet.module.kyc.dto.KycRequest;
import com.ewallet.module.kyc.dto.KycResponse;
import com.ewallet.module.kyc.service.KycService;
import com.ewallet.security.service.CurrentUserService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/kyc")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class KycController {

    private final KycService kycService;
    private final CurrentUserService currentUserService;

    @PostMapping
    public ResponseEntity<ApiResponse<KycResponse>> submit(
            @Valid @RequestBody KycRequest request
    ) {
        Long userId = currentUserService.getCurrentUser().getId();
        KycResponse response = kycService.submitKyc(userId, request);

        return ResponseEntity.ok(
                ApiResponse.success("KYC submitted successfully", response)
        );
    }

    @GetMapping
    public ResponseEntity<ApiResponse<KycResponse>> get() {
        Long userId = currentUserService.getCurrentUser().getId();
        KycResponse response = kycService.getKyc(userId);

        return ResponseEntity.ok(
                ApiResponse.success("KYC data retrieved successfully", response)
        );
    }
}