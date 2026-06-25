package com.ewallet.module.wallet.service;

import com.ewallet.module.transaction.entity.Transaction;
import com.ewallet.module.transaction.enums.TransactionStatus;
import com.ewallet.module.transaction.enums.TransactionType;
import com.ewallet.module.transaction.repository.TransactionRepository;
import com.ewallet.module.transaction.service.TransactionService;
import com.ewallet.module.transaction.util.TransactionCodeGenerator;
import com.ewallet.module.wallet.dto.TopUpResponse;
import com.ewallet.module.wallet.dto.WalletBalanceResponse;
import com.ewallet.module.wallet.entity.Wallet;
import com.ewallet.module.wallet.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class WalletService {

    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;

    private final TransactionService transactionService;

    private final TransactionCodeGenerator transactionCodeGenerator;

    public WalletBalanceResponse getBalance(Long userId){

        Wallet wallet = walletRepository
                .findByUserId(userId)
                .orElseThrow(() ->
                        new RuntimeException("Wallet not found"));

        return WalletBalanceResponse.builder()
                .walletNumber(wallet.getWalletNumber())
                .balance(wallet.getBalance())
                .build();
    }

    @Transactional
    public TopUpResponse topUp(
            Long userId,
            BigDecimal amount
    ) {

        if (amount == null ||
                amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException(
                    "Amount must be greater than 0");
        }

        Wallet wallet = walletRepository
                .findByUserId(userId)
                .orElseThrow(() ->
                        new RuntimeException("Wallet not found"));

        wallet.setBalance(
                wallet.getBalance().add(amount)
        );

        Transaction transaction =
                transactionService.createTopUpTransaction(
                        userId,
                        amount
                );

        return TopUpResponse.builder()
                .walletNumber(wallet.getWalletNumber())
                .amount(amount)
                .newBalance(wallet.getBalance())
                .transactionCode(
                        transaction.getTransactionCode()
                )
                .build();
    }

    public void createWallet(Long userId){

        Wallet wallet = Wallet.builder()
                .userId(userId)
                .walletNumber(generateWalletNumber())
                .build();

        walletRepository.save(wallet);
    }

    private String generateWalletNumber() {
        return "WAL" + System.currentTimeMillis();
    }
}