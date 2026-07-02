package com.ewallet.module.wallet.service;

import com.ewallet.common.exception.InsufficientBalanceException;
import com.ewallet.common.exception.WalletNotFoundException;
import com.ewallet.module.transaction.entity.Transaction;
import com.ewallet.module.transaction.service.TransactionService;
import com.ewallet.module.wallet.dto.TopUpRequest;
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
    private final TransactionService transactionService;

    @Transactional(readOnly = true)
    public WalletBalanceResponse getBalance(Long userId) {
        // Sử dụng hàm KHÔNG LOCK để tăng tốc độ xem số dư
        Wallet wallet = walletRepository.findWalletByUserId(userId)
                .orElseThrow(() -> new WalletNotFoundException("Wallet not found"));

        return WalletBalanceResponse.builder()
                .walletNumber(wallet.getWalletNumber())
                .balance(wallet.getBalance())
                .build();
    }

    @Transactional
    public Wallet increaseBalance(Long userId, BigDecimal amount) {

        Wallet wallet = walletRepository.findByUserIdForUpdate(userId)
                .orElseThrow(() ->
                        new WalletNotFoundException("Wallet not found"));

        wallet.setBalance(wallet.getBalance().add(amount));

        return wallet;
    }

    @Transactional
    public Wallet decreaseBalance(Long userId, BigDecimal amount) {

        Wallet wallet = walletRepository.findByUserIdForUpdate(userId)
                .orElseThrow(() ->
                        new WalletNotFoundException("Wallet not found"));

        if (wallet.getBalance().compareTo(amount) < 0) {
            throw new InsufficientBalanceException("Insufficient balance");
        }

        wallet.setBalance(wallet.getBalance().subtract(amount));

        return wallet;
    }

    @Transactional
    public void createWallet(Long userId) {
        Wallet wallet = Wallet.builder()
                .userId(userId)
                .walletNumber("WAL" + (System.currentTimeMillis() % 100000000000L))
                .balance(BigDecimal.ZERO)
                .build();

        walletRepository.save(wallet);
    }
}