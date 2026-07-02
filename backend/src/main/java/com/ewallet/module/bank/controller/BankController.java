package com.ewallet.module.bank.controller;

import com.ewallet.common.dto.ApiResponse;
import com.ewallet.module.bank.dto.BankResponse;
import com.ewallet.module.bank.dto.LinkBankRequest;
import com.ewallet.module.bank.service.BankService;
import com.ewallet.module.user.entity.User;
import com.ewallet.module.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/banks")
@RequiredArgsConstructor
public class BankController {

    private final BankService bankService;
    private final UserService userService;

    @PostMapping("/link")
    public ApiResponse<BankResponse> linkBank(
            Authentication authentication,
            @Valid @RequestBody LinkBankRequest request
    ) {

        User user = userService.getByEmail(authentication.getName());

        return ApiResponse.success(
                "Bank linked successfully",
                bankService.linkBank(user, request)
        );
    }

    @GetMapping
    public ApiResponse<List<BankResponse>> getMyBanks(
            Authentication authentication
    ) {

        User user = userService.getByEmail(authentication.getName());

        return ApiResponse.success(
                "Success",
                bankService.getMyBanks(user.getId())
        );
    }

    @GetMapping("/history")
    public ApiResponse<List<BankResponse>> getHistory(
            Authentication authentication
    ) {

        User user = userService.getByEmail(authentication.getName());

        return ApiResponse.success(
                "Success",
                bankService.getHistory(user.getId())
        );
    }

    @DeleteMapping("/{bankId}")
    public ApiResponse<Void> unlinkBank(
            Authentication authentication,
            @PathVariable Long bankId
    ) {

        User user = userService.getByEmail(authentication.getName());

        bankService.unlinkBank(user.getId(), bankId);

        return ApiResponse.success("Bank account unlinked successfully");
    }
}