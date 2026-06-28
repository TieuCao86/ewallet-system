package com.ewallet.module.wallet.service;

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
    public TopUpResponse topUp(Long userId, TopUpRequest request) {
        // Sử dụng hàm CÓ LOCK để bảo vệ dữ liệu khi nạp tiền, tránh race condition
        Wallet wallet = walletRepository.findByUserIdForUpdate(userId)
                .orElseThrow(() -> new WalletNotFoundException("Wallet not found"));

        BigDecimal topUpAmount = request.getAmount();
        wallet.setBalance(wallet.getBalance().add(topUpAmount));
        walletRepository.save(wallet);

        // Tạo lịch sử giao dịch thành công
        Transaction transaction = transactionService.createTopUpTransaction(userId, topUpAmount);

        return TopUpResponse.builder()
                .walletNumber(wallet.getWalletNumber())
                .amount(topUpAmount)
                .newBalance(wallet.getBalance())
                .transactionCode(transaction.getTransactionCode())
                .build();
    }

    @Transactional
    public void createWallet(Long userId) {
        Wallet wallet = Wallet.builder()
                .userId(userId)
                .walletNumber("WAL" + (System.currentTimeMillis() % 100000000000L))
                .balance(BigDecimal.ZERO) // Luôn khởi tạo là 0 để tránh lỗi NullPointerException
                .build();

        walletRepository.save(wallet);
    }
}