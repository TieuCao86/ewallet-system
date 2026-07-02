package com.ewallet.module.bank.service;

import com.ewallet.common.exception.BusinessException;
import com.ewallet.common.exception.NotFoundException;
import com.ewallet.module.bank.dto.BankResponse;
import com.ewallet.module.bank.dto.DepositRequest;
import com.ewallet.module.bank.dto.LinkBankRequest;
import com.ewallet.module.bank.dto.WithdrawRequest;
import com.ewallet.module.bank.entity.BankAccount;
import com.ewallet.module.bank.enums.BankStatus;
import com.ewallet.module.bank.repository.BankRepository;
import com.ewallet.module.transaction.entity.Transaction;
import com.ewallet.module.transaction.service.TransactionService;
import com.ewallet.module.user.entity.User;
import com.ewallet.module.wallet.dto.TopUpResponse;
import com.ewallet.module.wallet.entity.Wallet;
import com.ewallet.module.wallet.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BankService {

    private final BankRepository bankRepository;

    private final WalletService walletService;
    private final TransactionService transactionService;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public BankResponse linkBank(
            User user,
            LinkBankRequest request
    ) {

        if (bankRepository.existsByAccountNumber(request.getAccountNumber())) {
            throw new BusinessException("Bank account already linked");
        }

        if (bankRepository.existsByUserIdAndBankCode(
                user.getId(),
                request.getBankCode()
        )) {
            throw new BusinessException("This bank has already been linked");
        }

        BankAccount bank = BankAccount.builder()
                .userId(user.getId())
                .bankCode(request.getBankCode())
                .accountNumber(request.getAccountNumber())
                .accountHolder(user.getFullName())
                .phone(request.getPhone())
                .balance(BigDecimal.valueOf(100_000_000)) // demo
                .status(BankStatus.ACTIVE)
                .build();

        bankRepository.save(bank);

        return toResponse(bank);
    }

    @Transactional(readOnly = true)
    public List<BankResponse> getMyBanks(Long userId) {

        return bankRepository.findAllByUserId(userId)
                .stream()
                .filter(bank -> bank.getStatus() == BankStatus.ACTIVE)
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public void unlinkBank(
            Long userId,
            Long bankId
    ) {

        BankAccount bank = bankRepository.findByIdAndUserId(bankId, userId)
                .orElseThrow(() ->
                        new NotFoundException("Bank account not found"));

        if (bank.getStatus() == BankStatus.UNLINKED) {
            throw new BusinessException("Bank account already unlinked");
        }

        bank.setStatus(BankStatus.UNLINKED);
    }

    @Transactional(readOnly = true)
    public List<BankResponse> getHistory(Long userId) {

        return bankRepository.findAllByUserId(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public TopUpResponse deposit(
            User user,
            DepositRequest request
    ) {

        BankAccount bank = bankRepository.findByIdForUpdate(request.getBankId())
                .orElseThrow(() ->
                        new NotFoundException("Bank account not found"));

        if (!bank.getUserId().equals(user.getId())) {
            throw new BusinessException("Bank account does not belong to user");
        }

        if (bank.getStatus() != BankStatus.ACTIVE) {
            throw new BusinessException("Bank account is inactive");
        }

        if (!passwordEncoder.matches(request.getPin(), user.getPin())) {
            throw new BusinessException("Invalid PIN");
        }

        if (bank.getBalance().compareTo(request.getAmount()) < 0) {
            throw new BusinessException("Insufficient bank balance");
        }

        bank.setBalance(
                bank.getBalance().subtract(request.getAmount())
        );

        Wallet wallet = walletService.increaseBalance(
                user.getId(),
                request.getAmount()
        );

        Transaction tx = transactionService.createTopUpTransaction(
                user.getId(),
                bank,
                request.getAmount()
        );

        return TopUpResponse.builder()
                .walletNumber(wallet.getWalletNumber())
                .amount(request.getAmount())
                .newBalance(wallet.getBalance())
                .transactionCode(tx.getTransactionCode())
                .build();
    }

    @Transactional
    public void withdraw(
            User user,
            WithdrawRequest request
    ) {

        BankAccount bank = bankRepository.findByIdForUpdate(request.getBankId())
                .orElseThrow(() ->
                        new NotFoundException("Bank account not found"));

        if (!bank.getUserId().equals(user.getId())) {
            throw new BusinessException("Bank account does not belong to user");
        }

        if (bank.getStatus() != BankStatus.ACTIVE) {
            throw new BusinessException("Bank account inactive");
        }

        if (!passwordEncoder.matches(request.getPin(), user.getPin())) {
            throw new BusinessException("Invalid PIN");
        }

        walletService.decreaseBalance(
                user.getId(),
                request.getAmount()
        );

        bank.setBalance(
                bank.getBalance().add(request.getAmount())
        );

        transactionService.createWithdrawTransaction(
                user.getId(),
                bank,
                request.getAmount()
        );
    }

    private BankResponse toResponse(BankAccount bank) {

        return BankResponse.builder()
                .id(bank.getId())
                .bankCode(bank.getBankCode())
                .bankName(bank.getBankCode().getBankName())
                .accountNumber(bank.getAccountNumber())
                .accountHolder(bank.getAccountHolder())
                .balance(bank.getBalance())
                .build();
    }
}