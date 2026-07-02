package com.ewallet.module.wallet.controller;

import com.ewallet.common.dto.ApiResponse;
import com.ewallet.module.user.entity.User;
import com.ewallet.module.user.service.UserService;
import com.ewallet.module.wallet.dto.TopUpRequest;
import com.ewallet.module.wallet.dto.TopUpResponse;
import com.ewallet.module.wallet.dto.WalletBalanceResponse;
import com.ewallet.module.wallet.service.WalletService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wallets")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class WalletController {

    private final WalletService walletService;
    private final UserService userService;

    @GetMapping("/balance")
    public ResponseEntity<ApiResponse<WalletBalanceResponse>> getBalance(
            Authentication authentication
    ) {

        User user = getCurrentUser(authentication);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Wallet balance retrieved successfully",
                        walletService.getBalance(user.getId())
                )
        );
    }

    private User getCurrentUser(Authentication authentication) {
        return userService.getByEmail(authentication.getName());
    }
}