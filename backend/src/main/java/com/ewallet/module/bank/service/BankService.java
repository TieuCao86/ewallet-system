package com.ewallet.module.bank.service;

import com.ewallet.common.exception.BusinessException;
import com.ewallet.common.exception.NotFoundException;
import com.ewallet.module.bank.dto.*;
import com.ewallet.module.bank.entity.Bank;
import com.ewallet.module.bank.entity.BankAccount;
import com.ewallet.module.bank.enums.BankStatus;
import com.ewallet.module.bank.repository.BankAccountRepository;
import com.ewallet.module.bank.repository.BankRepository;
import com.ewallet.module.transaction.entity.Transaction;
import com.ewallet.module.transaction.service.TransactionService;
import com.ewallet.module.user.entity.User;
import com.ewallet.module.user.repository.UserRepository;
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
    private final BankAccountRepository bankAccountRepository;
    private final UserRepository userRepository;

    private final WalletService walletService;
    private final TransactionService transactionService;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public BankResponse linkBank(Long userId, LinkBankRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        if (bankAccountRepository.existsByBank_IdAndAccountNumber(request.getBankId(), request.getAccountNumber())) {
            throw new BusinessException("Bank account already linked");
        }

        Bank bankInfo = bankRepository.findById(request.getBankId())
                .orElseThrow(() -> new NotFoundException("Bank not found"));

        if (!bankInfo.getActive()) {
            throw new BusinessException("Bank is inactive");
        }

        if (bankAccountRepository.existsByUserIdAndBank_Id(userId, bankInfo.getId())) {
            throw new BusinessException("This bank has already been linked");
        }

        BankAccount bankAccount = BankAccount.builder()
                .userId(userId)
                .bank(bankInfo)
                .accountNumber(request.getAccountNumber())
                .accountHolder(user.getFullName())
                .phone(request.getPhone())
                .balance(BigDecimal.valueOf(100_000_000)) // Mock số dư ngân hàng
                .status(BankStatus.ACTIVE)
                .build();

        bankAccountRepository.save(bankAccount);
        return toResponse(bankAccount);
    }

    @Transactional(readOnly = true)
    public List<BankResponse> getMyBanks(Long userId) {
        return bankAccountRepository.findAllByUserId(userId)
                .stream()
                .filter(bank -> bank.getStatus() == BankStatus.ACTIVE)
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public void unlinkBank(Long userId, Long bankId) {
        BankAccount bank = bankAccountRepository.findByIdAndUserId(bankId, userId)
                .orElseThrow(() -> new NotFoundException("Bank account not found"));

        if (bank.getStatus() == BankStatus.UNLINKED) {
            throw new BusinessException("Bank account already unlinked");
        }

        bank.setStatus(BankStatus.UNLINKED);
    }

    @Transactional(readOnly = true)
    public List<BankResponse> getHistory(Long userId) {
        return bankAccountRepository.findAllByUserId(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<BankMasterResponse> getMasterBanks() {
        return bankRepository.findByActiveTrue()
                .stream()
                .map(bank -> BankMasterResponse.builder()
                        .id(bank.getId())
                        .code(bank.getCode())
                        .name(bank.getName())
                        .logo(bank.getLogo())
                        .build())
                .toList();
    }

    @Transactional
    public TopUpResponse deposit(Long userId, DepositRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        BankAccount bank = bankAccountRepository.findByIdForUpdate(request.getBankId())
                .orElseThrow(() -> new NotFoundException("Bank account not found"));

        if (!bank.getUserId().equals(userId)) {
            throw new BusinessException("Bank account does not belong to user");
        }

        if (bank.getStatus() != BankStatus.ACTIVE) {
            throw new BusinessException("Bank account is inactive");
        }

        // Kiểm tra an toàn PIN tránh lỗi NullPointerException / mã hóa sai phiên làm việc
        if (user.getPin() == null) {
            throw new BusinessException("Please create transaction PIN first");
        }
        if (!passwordEncoder.matches(request.getPin(), user.getPin())) {
            throw new BusinessException("Invalid PIN");
        }

        if (bank.getBalance().compareTo(request.getAmount()) < 0) {
            throw new BusinessException("Insufficient bank balance");
        }

        bank.setBalance(bank.getBalance().subtract(request.getAmount()));

        Wallet wallet = walletService.increaseBalance(userId, request.getAmount());
        Transaction tx = transactionService.createTopUpTransaction(userId, bank, request.getAmount());

        return TopUpResponse.builder()
                .walletNumber(wallet.getWalletNumber())
                .amount(request.getAmount())
                .newBalance(wallet.getBalance())
                .transactionCode(tx.getTransactionCode())
                .build();
    }

    @Transactional
    public WithdrawResponse withdraw(Long userId, WithdrawRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        BankAccount bank = bankAccountRepository.findByIdForUpdate(request.getBankId())
                .orElseThrow(() -> new NotFoundException("Bank account not found"));

        if (!bank.getUserId().equals(userId)) {
            throw new BusinessException("Bank account does not belong to user");
        }

        if (bank.getStatus() != BankStatus.ACTIVE) {
            throw new BusinessException("Bank account inactive");
        }

        if (user.getPin() == null) {
            throw new BusinessException("Please create transaction PIN first");
        }
        if (!passwordEncoder.matches(request.getPin(), user.getPin())) {
            throw new BusinessException("Invalid PIN");
        }

        Wallet wallet = walletService.decreaseBalance(userId, request.getAmount());
        bank.setBalance(bank.getBalance().add(request.getAmount()));

        Transaction transaction = transactionService.createWithdrawTransaction(userId, bank, request.getAmount());

        return WithdrawResponse.builder()
                .amount(request.getAmount())
                .walletBalance(wallet.getBalance())
                .bankBalance(bank.getBalance())
                .transactionCode(transaction.getTransactionCode())
                .build();
    }

    private BankResponse toResponse(BankAccount bank) {
        return BankResponse.builder()
                .id(bank.getId())
                .bankId(bank.getBank().getId())
                .bankName(bank.getBank().getName())
                .accountNumber(bank.getAccountNumber())
                .accountHolder(bank.getAccountHolder())
                .balance(bank.getBalance())
                .build();
    }
}