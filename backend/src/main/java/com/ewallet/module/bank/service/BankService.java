package com.ewallet.module.bank.service;

import com.ewallet.common.exception.BusinessException;
import com.ewallet.common.exception.NotFoundException;
import com.ewallet.module.bank.dto.*;
import com.ewallet.module.bank.entity.Bank;
import com.ewallet.module.bank.entity.BankAccount;
import com.ewallet.module.bank.enums.BankStatus;
import com.ewallet.module.bank.mapper.BankMapper;
import com.ewallet.module.bank.repository.BankAccountRepository;
import com.ewallet.module.bank.repository.BankRepository;
import com.ewallet.module.transaction.entity.Transaction;
import com.ewallet.module.transaction.repository.TransactionRepository;
import com.ewallet.module.transaction.service.TransactionService;
import com.ewallet.module.user.entity.User;
import com.ewallet.module.user.service.UserService;
import com.ewallet.module.wallet.dto.TopUpResponse;
import com.ewallet.module.wallet.entity.Wallet;
import com.ewallet.module.wallet.mapper.WalletMapper;
import com.ewallet.module.wallet.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BankService {

    private final BankRepository bankRepository;
    private final BankAccountRepository bankAccountRepository;
    private final TransactionRepository transactionRepository;

    private final WalletService walletService;
    private final TransactionService transactionService;
    private final UserService userService;

    private final BankMapper bankMapper;
    private final WalletMapper walletMapper;

    @Transactional
    public LinkBankResponse linkBank(Long userId, LinkBankRequest request) {
        User user = userService.getById(userId);

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

        return bankMapper.toLinkResponse(bankAccount);
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

    @Transactional
    public TopUpResponse deposit(Long userId, DepositRequest request) {
        User user = userService.getById(userId);

        BankAccount bank = bankAccountRepository.findByIdForUpdate(request.getBankId())
                .orElseThrow(() -> new NotFoundException("Bank account not found"));

        if (!bank.getUserId().equals(userId)) {
            throw new BusinessException("Bank account does not belong to user");
        }

        if (bank.getStatus() != BankStatus.ACTIVE) {
            throw new BusinessException("Bank account is inactive");
        }

        userService.validatePin(user, request.getPin());

        if (bank.getBalance().compareTo(request.getAmount()) < 0) {
            throw new BusinessException("Insufficient bank balance");
        }

        bank.setBalance(bank.getBalance().subtract(request.getAmount()));

        Wallet wallet = walletService.increaseBalance(userId, request.getAmount());

        Transaction tx = transactionService.createTopUpTransaction(userId, bank, request.getAmount());
        transactionRepository.save(tx);

        return walletMapper.toTopUpResponse(tx, wallet);
    }

    @Transactional
    public WithdrawResponse withdraw(Long userId, WithdrawRequest request) {
        User user = userService.getById(userId);

        BankAccount bank = bankAccountRepository.findByIdForUpdate(request.getBankId())
                .orElseThrow(() -> new NotFoundException("Bank account not found"));

        if (!bank.getUserId().equals(userId)) {
            throw new BusinessException("Bank account does not belong to user");
        }

        if (bank.getStatus() != BankStatus.ACTIVE) {
            throw new BusinessException("Bank account inactive");
        }

        userService.validatePin(user, request.getPin());

        Wallet wallet = walletService.decreaseBalance(userId, request.getAmount());
        bank.setBalance(bank.getBalance().add(request.getAmount()));

        Transaction tx = transactionService.createWithdrawTransaction(userId, bank, request.getAmount());
        transactionRepository.save(tx);

        return bankMapper.toWithdrawResponse(tx, wallet.getBalance(), bank.getBalance());
    }

    @Transactional(readOnly = true)
    public List<BankResponse> getMyBanks(Long userId) {
        return bankAccountRepository.findAllByUserId(userId)
                .stream()
                .filter(bank -> bank.getStatus() == BankStatus.ACTIVE)
                .map(bankMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<BankResponse> getHistory(Long userId) {
        return bankAccountRepository.findAllByUserId(userId)
                .stream()
                .map(bankMapper::toResponse)
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
}