package com.ewallet.module.wallet.controller;

import com.ewallet.common.dto.ApiResponse;
import com.ewallet.module.wallet.dto.WalletBalanceResponse;
import com.ewallet.module.wallet.service.WalletService;
import com.ewallet.security.service.CurrentUserService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wallets")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class WalletController {

    private final WalletService walletService;
    private final CurrentUserService currentUserService;

    @GetMapping("/balance")
    public ResponseEntity<ApiResponse<WalletBalanceResponse>> getBalance() {
        Long userId = currentUserService.getCurrentUser().getId();

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Wallet balance retrieved successfully",
                        walletService.getBalance(userId)
                )
        );
    }
}