package com.ewallet.module.wallet.service;

import com.ewallet.common.exception.core.WalletNotFoundException;
import com.ewallet.common.exception.security.InsufficientBalanceException;
import com.ewallet.module.wallet.dto.WalletBalanceResponse;
import com.ewallet.module.wallet.entity.Wallet;
import com.ewallet.module.wallet.mapper.WalletMapper;
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
    private final WalletMapper walletMapper;

    @Transactional(readOnly = true)
    public WalletBalanceResponse getBalance(Long userId) {
        // Sử dụng hàm KHÔNG LOCK để tối ưu hiệu năng đọc (Read heavy) khi người dùng chỉ xem số dư
        Wallet wallet = walletRepository.findWalletByUserId(userId)
                .orElseThrow(() -> new WalletNotFoundException(userId));

        return walletMapper.toBalanceResponse(wallet);
    }

    @Transactional
    public Wallet increaseBalance(Long userId, BigDecimal amount) {
        // Sử dụng PESSIMISTIC_WRITE lock để bảo vệ dữ liệu khi ghi (Write heavy)
        Wallet wallet = walletRepository.findByUserIdForUpdate(userId)
                .orElseThrow(() -> new WalletNotFoundException(userId));

        wallet.setBalance(wallet.getBalance().add(amount));
        return walletRepository.save(wallet); // Đảm bảo thực thi lưu trạng thái mới
    }

    @Transactional
    public Wallet decreaseBalance(Long userId, BigDecimal amount) {
        Wallet wallet = walletRepository.findByUserIdForUpdate(userId)
                .orElseThrow(() -> new WalletNotFoundException(userId));

        if (wallet.getBalance().compareTo(amount) < 0) {
            // Ghi nhận chi tiết số dư thực tế và số tiền yêu cầu trừ vào log nội bộ để dev đối soát
            throw new InsufficientBalanceException(wallet.getBalance(), amount);
        }

        wallet.setBalance(wallet.getBalance().subtract(amount));
        return walletRepository.save(wallet);
    }

    @Transactional
    public void createWallet(Long userId) {
        // Cơ chế tạo số ví ngẫu nhiên an toàn, tránh race-condition trùng lặp mã ví khi scale đa luồng
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