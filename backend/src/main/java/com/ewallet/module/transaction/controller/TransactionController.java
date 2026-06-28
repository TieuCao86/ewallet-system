package com.ewallet.module.transaction.controller;

import com.ewallet.common.dto.ApiResponse;
import com.ewallet.module.transaction.dto.TransactionResponse;
import com.ewallet.module.transaction.dto.TransferRequest;
import com.ewallet.module.transaction.dto.TransferResponse;
import com.ewallet.module.transaction.service.TransactionService;
import com.ewallet.module.user.entity.User;
import com.ewallet.module.user.service.UserService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class TransactionController {

    private final TransactionService transactionService;
    private final UserService userService;

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<TransactionResponse>>> getHistory(
            Authentication authentication
    ) {

        User user = userService.getByEmail(authentication.getName());

        List<TransactionResponse> history =
                transactionService.getHistory(user.getId());

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Transaction history retrieved successfully",
                        transactionService.getHistory(user.getId())
                )
        );
    }

    @PostMapping("/transfer")
    public ResponseEntity<ApiResponse<TransferResponse>> transfer(
            @Valid @RequestBody TransferRequest request,
            Authentication authentication
    ) {

        User sender = userService.getByEmail(authentication.getName());

        TransferResponse response =
                transactionService.transfer(sender, request);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Transfer completed successfully",
                        transactionService.transfer(sender, request)
                )
        );
    }
}