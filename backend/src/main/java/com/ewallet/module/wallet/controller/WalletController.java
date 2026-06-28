package com.ewallet.module.wallet.controller;

import com.ewallet.module.user.entity.User;
import com.ewallet.module.user.service.UserService;
import com.ewallet.module.wallet.dto.TopUpRequest;
import com.ewallet.module.wallet.dto.TopUpResponse;
import com.ewallet.module.wallet.dto.WalletBalanceResponse;
import com.ewallet.module.wallet.service.WalletService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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
    public WalletBalanceResponse getBalance(Authentication authentication) {
        User user = userService.getByEmail(authentication.getName());
        return walletService.getBalance(user.getId());
    }

    @PostMapping("/topup")
    public TopUpResponse topUp(
            @Valid @RequestBody TopUpRequest request,
            Authentication authentication
    ) {
        User user = userService.getByEmail(authentication.getName());
        return walletService.topUp(user.getId(), request);
    }
}