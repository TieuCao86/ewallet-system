package com.ewallet.module.wallet.service;

import com.ewallet.module.user.entity.User;
import com.ewallet.module.wallet.dto.WalletBalanceResponse;
import com.ewallet.module.wallet.entity.Wallet;
import com.ewallet.module.wallet.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class WalletService {

    private final WalletRepository walletRepository;

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