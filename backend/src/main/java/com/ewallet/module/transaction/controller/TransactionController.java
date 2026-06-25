package com.ewallet.module.transaction.controller;

import com.ewallet.module.transaction.dto.TransactionResponse;
import com.ewallet.module.transaction.service.TransactionService;
import com.ewallet.module.user.entity.User;
import com.ewallet.module.user.service.UserService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
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
}