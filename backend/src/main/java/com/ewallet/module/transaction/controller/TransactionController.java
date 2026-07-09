package com.ewallet.module.transaction.controller;

import com.ewallet.common.dto.ApiResponse;
import com.ewallet.module.transaction.dto.TransactionResponse;
import com.ewallet.module.transaction.dto.TransferRequest;
import com.ewallet.module.transaction.dto.TransferResponse;
import com.ewallet.module.transaction.service.TransactionService;
import com.ewallet.security.service.CurrentUserService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class TransactionController {

    private final TransactionService transactionService;
    private final CurrentUserService currentUserService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<TransactionResponse>>> getTransactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {

        Long userId = currentUserService.getCurrentUser().getId();

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Transactions retrieved successfully",
                        transactionService.getTransactions(userId, page, size)
                )
        );
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<TransactionResponse>>> getHistory() {
        Long userId = currentUserService.getCurrentUser().getId();
        List<TransactionResponse> history = transactionService.getHistory(userId);

        return ResponseEntity.ok(
                ApiResponse.success("Transaction history retrieved successfully", history)
        );
    }

    @PostMapping("/transfer")
    public ResponseEntity<ApiResponse<TransferResponse>> transfer(
            @Valid @RequestBody TransferRequest request
    ) {
        Long senderId = currentUserService.getCurrentUser().getId();
        TransferResponse response = transactionService.transfer(senderId, request);

        return ResponseEntity.ok(
                ApiResponse.success("Transfer completed successfully", response)
        );
    }
}