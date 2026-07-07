package com.ewallet.module.bank.controller;

import com.ewallet.common.dto.ApiResponse;
import com.ewallet.module.bank.dto.*;
import com.ewallet.module.bank.service.BankService;
import com.ewallet.module.wallet.dto.TopUpResponse;
import com.ewallet.security.service.CurrentUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/banks")
@RequiredArgsConstructor
public class BankController {

    private final BankService bankService;
    private final CurrentUserService currentUserService;

    @GetMapping
    public ApiResponse<List<BankResponse>> getMyBanks() {
        Long userId = currentUserService.getCurrentUser().getId();
        return ApiResponse.success("Success", bankService.getMyBanks(userId));
    }

    @PostMapping("/link")
    public ApiResponse<BankResponse> linkBank(@Valid @RequestBody LinkBankRequest request) {
        Long userId = currentUserService.getCurrentUser().getId();
        return ApiResponse.success("Bank linked successfully", bankService.linkBank(userId, request));
    }

    @GetMapping("/history")
    public ApiResponse<List<BankResponse>> getHistory() {
        Long userId = currentUserService.getCurrentUser().getId();
        return ApiResponse.success("Success", bankService.getHistory(userId));
    }

    @DeleteMapping("/{bankId}")
    public ApiResponse<Void> unlinkBank(@PathVariable Long bankId) {
        Long userId = currentUserService.getCurrentUser().getId();
        bankService.unlinkBank(userId, bankId);
        return ApiResponse.success("Bank account unlinked successfully");
    }

    @PostMapping("/deposit")
    public ApiResponse<TopUpResponse> deposit(@Valid @RequestBody DepositRequest request) {
        Long userId = currentUserService.getCurrentUser().getId();
        return ApiResponse.success("Deposit successful", bankService.deposit(userId, request));
    }

    @PostMapping("/withdraw")
    public ApiResponse<WithdrawResponse> withdraw(@Valid @RequestBody WithdrawRequest request) {
        Long userId = currentUserService.getCurrentUser().getId();
        return ApiResponse.success("Withdraw successful", bankService.withdraw(userId, request));
    }

    @GetMapping("/master")
    public ApiResponse<List<BankMasterResponse>> getMasterBanks() {
        return ApiResponse.success("Success", bankService.getMasterBanks());
    }
}