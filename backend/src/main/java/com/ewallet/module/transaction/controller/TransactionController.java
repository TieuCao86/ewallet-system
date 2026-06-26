package com.ewallet.module.transaction.controller;

import com.ewallet.module.transaction.dto.TransactionResponse;
import com.ewallet.module.transaction.dto.TransferRequest;
import com.ewallet.module.transaction.dto.TransferResponse;
import com.ewallet.module.transaction.service.TransactionService;
import com.ewallet.module.user.entity.User;
import com.ewallet.module.user.service.UserService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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
    public List<TransactionResponse> getHistory(
            Authentication authentication){

        User user = userService.getByEmail(
                authentication.getName()
        );

        return transactionService.getHistory(
                user.getId()
        );
    }

    @PostMapping("/transfer")
    public TransferResponse transfer(
            @Valid @RequestBody TransferRequest request,
            Authentication authentication
    ) {

        User sender =
                userService.getByEmail(
                        authentication.getName()
                );

        return transactionService.transfer(
                sender,
                request
        );
    }
}