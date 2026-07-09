package com.ewallet.module.transaction.controller;

import com.ewallet.common.dto.ApiResponse;
import com.ewallet.module.transaction.dto.TransactionResponse;
import com.ewallet.module.transaction.dto.TransferRequest;
import com.ewallet.module.transaction.dto.TransferResponse;
import com.ewallet.module.transaction.service.TransactionService;
import com.ewallet.security.principal.UserPrincipal;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class TransactionController {

    private final TransactionService transactionService;

    @GetMapping
    public ApiResponse<Page<TransactionResponse>> getTransactions(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Long userId = userPrincipal.getUser().getId();
        return ApiResponse.success(
                "Transactions retrieved successfully",
                transactionService.getTransactions(userId, page, size)
        );
    }

    @GetMapping("/history")
    public ApiResponse<List<TransactionResponse>> getHistory(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        Long userId = userPrincipal.getUser().getId();
        return ApiResponse.success(
                "Transaction history retrieved successfully",
                transactionService.getHistory(userId)
        );
    }

    @PostMapping("/transfer")
    public ApiResponse<TransferResponse> transfer(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody TransferRequest request
    ) {
        Long senderId = userPrincipal.getUser().getId();
        return ApiResponse.success(
                "Transfer completed successfully",
                transactionService.transfer(senderId, request)
        );
    }
}