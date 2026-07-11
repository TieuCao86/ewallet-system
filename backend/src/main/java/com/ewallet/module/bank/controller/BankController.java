package com.ewallet.module.bank.controller;

import com.ewallet.common.dto.ApiResponse;
import com.ewallet.module.bank.dto.*;
import com.ewallet.module.bank.service.BankService;
import com.ewallet.module.wallet.dto.TopUpResponse;
import com.ewallet.security.principal.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.apache.coyote.BadRequestException;
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

    // --- LUỒNG NẠP TIỀN (DEPOSIT) ---

    @PostMapping("/deposit/initiate")
    public ApiResponse<Void> initiateDeposit(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody DepositRequest request
    ) {
        bankService.initiateDeposit(userPrincipal.getUser().getId(), request);
        return ApiResponse.success("Mã OTP nạp tiền đã được gửi thành công");
    }

    @PostMapping("/deposit/confirm")
    public ApiResponse<TopUpResponse> confirmDeposit(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody DepositRequest request,
            @RequestParam String otp
    ) {
        TopUpResponse response = bankService.confirmDeposit(userPrincipal.getUser().getId(), request, otp);
        return ApiResponse.success("Nạp tiền vào ví thành công", response);
    }

    // --- LUỒNG RÚT TIỀN (WITHDRAW) ---

    @PostMapping("/withdraw/initiate")
    public ApiResponse<Void> initiateWithdraw(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody WithdrawRequest request
    ) {
        bankService.initiateWithdraw(userPrincipal.getUser().getId(), request);
        return ApiResponse.success("Mã OTP rút tiền đã được gửi thành công");
    }

    @PostMapping("/withdraw/confirm")
    public ApiResponse<WithdrawResponse> confirmWithdraw(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody WithdrawRequest request,
            @RequestParam String otp
    ) {
        WithdrawResponse response = bankService.confirmWithdraw(userPrincipal.getUser().getId(), request, otp);
        return ApiResponse.success("Rút tiền về tài khoản ngân hàng thành công", response);
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