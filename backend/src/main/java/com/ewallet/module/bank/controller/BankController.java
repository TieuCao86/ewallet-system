package com.ewallet.module.bank.controller;

import com.ewallet.common.dto.ApiResponse;
import com.ewallet.module.bank.dto.*;
import com.ewallet.module.bank.service.BankService;
import com.ewallet.module.wallet.dto.TopUpResponse;
import com.ewallet.security.principal.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/banks")
@RequiredArgsConstructor
public class BankController {

    private final BankService bankService;

    @GetMapping
    public ApiResponse<List<BankResponse>> getMyBanks(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ApiResponse.success("Success", bankService.getMyBanks(userPrincipal.getUser().getId()));
    }

    @GetMapping("/master")
    public ApiResponse<List<BankMasterResponse>> getMasterBanks() {
        return ApiResponse.success("Success", bankService.getMasterBanks());
    }

    @GetMapping("/history")
    public ApiResponse<List<BankResponse>> getHistory(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ApiResponse.success("Success", bankService.getHistory(userPrincipal.getUser().getId()));
    }


    @PostMapping("/link")
    public ApiResponse<LinkBankResponse> linkBank(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody LinkBankRequest request
    ) {
        return ApiResponse.success("Bank linked successfully", bankService.linkBank(userPrincipal.getUser().getId(), request));
    }

    @PostMapping("/deposit")
    public ApiResponse<TopUpResponse> deposit(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody DepositRequest request
    ) {
        return ApiResponse.success("Deposit successful", bankService.deposit(userPrincipal.getUser().getId(), request));
    }

    @PostMapping("/withdraw")
    public ApiResponse<WithdrawResponse> withdraw(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody WithdrawRequest request
    ) {
        return ApiResponse.success("Withdraw successful", bankService.withdraw(userPrincipal.getUser().getId(), request));
    }

    @DeleteMapping("/{bankId}")
    public ApiResponse<Void> unlinkBank(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long bankId
    ) {
        bankService.unlinkBank(userPrincipal.getUser().getId(), bankId);
        return ApiResponse.success("Bank account unlinked successfully");
    }
}