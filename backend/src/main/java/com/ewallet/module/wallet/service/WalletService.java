package com.ewallet.module.wallet.service;

import com.ewallet.common.exception.InsufficientBalanceException;
import com.ewallet.common.exception.WalletNotFoundException;
import com.ewallet.module.wallet.dto.WalletBalanceResponse;
import com.ewallet.module.wallet.entity.Wallet;
import com.ewallet.module.wallet.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WalletService {

    private final WalletRepository walletRepository;

    @Transactional(readOnly = true)
    public WalletBalanceResponse getBalance(Long userId) {
        // Giữ nguyên: Sử dụng hàm KHÔNG LOCK để tăng tốc độ xem số dư độc lập
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
                .orElseThrow(() -> new WalletNotFoundException("Wallet not found"));

        wallet.setBalance(wallet.getBalance().add(amount));
        return wallet; // Dirty checking tự động cập nhật nhờ @Transactional
    }

    @Transactional
    public Wallet decreaseBalance(Long userId, BigDecimal amount) {
        Wallet wallet = walletRepository.findByUserIdForUpdate(userId)
                .orElseThrow(() -> new WalletNotFoundException("Wallet not found"));

        if (wallet.getBalance().compareTo(amount) < 0) {
            throw new InsufficientBalanceException("Insufficient balance");
        }

        wallet.setBalance(wallet.getBalance().subtract(amount));
        return wallet;
    }

    @Transactional
    public void createWallet(Long userId) {
        // Thay thế cơ chế tạo chuỗi số ngẫu nhiên an toàn hơn từ UUID để tránh trùng lặp khi chạy đa luồng
        String uniqueSuffix = String.valueOf(Math.abs(UUID.randomUUID().getMostSignificantBits())).substring(0, 10);
        String walletNumber = "WAL" + uniqueSuffix;

        Wallet wallet = Wallet.builder()
                .userId(userId)
                .walletNumber(walletNumber)
                .balance(BigDecimal.ZERO)
                .build();

        walletRepository.save(wallet);
    }
}