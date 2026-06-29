package com.ewallet.module.transaction.service;

import com.ewallet.common.exception.BusinessException;
import com.ewallet.common.exception.InsufficientBalanceException;
import com.ewallet.common.exception.InvalidPinException;
import com.ewallet.common.exception.NotFoundException;
import com.ewallet.module.kyc.enums.KycStatus;
import com.ewallet.module.kyc.service.KycService;
import com.ewallet.module.transaction.dto.TransactionResponse;
import com.ewallet.module.transaction.dto.TransferRequest;
import com.ewallet.module.transaction.dto.TransferResponse;
import com.ewallet.module.transaction.entity.Transaction;
import com.ewallet.module.transaction.enums.TransactionStatus;
import com.ewallet.module.transaction.enums.TransactionType;
import com.ewallet.module.transaction.repository.TransactionRepository;
import com.ewallet.module.transaction.util.TransactionCodeGenerator;
import com.ewallet.module.user.entity.User;
import com.ewallet.module.user.repository.UserRepository;
import com.ewallet.module.wallet.entity.Wallet;
import com.ewallet.module.wallet.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final WalletRepository walletRepository;

    private final KycService kycService;

    private final TransactionCodeGenerator transactionCodeGenerator;
    private final PasswordEncoder passwordEncoder;

    public Transaction createTopUpTransaction(Long userId, BigDecimal amount) {
        Transaction transaction = Transaction.builder()
                .transactionCode(transactionCodeGenerator.generate())
                .senderUserId(userId)
                .amount(amount)
                .fee(BigDecimal.ZERO)
                .type(TransactionType.TOP_UP)
                .status(TransactionStatus.SUCCESS)
                .description("Wallet Top Up")
                .build();

        return transactionRepository.save(transaction);
    }

    @Transactional(readOnly = true)
    public List<TransactionResponse> getHistory(Long userId) {
        List<Transaction> transactions = transactionRepository
                .findBySenderUserIdOrReceiverUserIdOrderByCreatedAtDesc(userId, userId);

        return transactions.stream()
                .map(tx -> {
                    String direction = "SYSTEM";
                    if (tx.getType() == TransactionType.TRANSFER) {
                        direction = userId.equals(tx.getSenderUserId()) ? "SENT" : "RECEIVED";
                    }

                    return TransactionResponse.builder()
                            .transactionCode(tx.getTransactionCode())
                            .amount(tx.getAmount())
                            .fee(tx.getFee())
                            .type(tx.getType())
                            .status(tx.getStatus())
                            .direction(direction)
                            .description(tx.getDescription())
                            .createdAt(tx.getCreatedAt())
                            .build();
                })
                .toList();
    }

    @Transactional
    public TransferResponse transfer(User sender, TransferRequest request) {
        // Gọn gàng: Ủy quyền check KYC cho KycService xử lý
        kycService.validateKycApproval(sender);

        validatePin(sender, request.getPin());

        User receiver = userRepository.findByPhone(request.getReceiverPhone())
                .orElseThrow(() -> new NotFoundException("Receiver not found"));

        if (sender.getId().equals(receiver.getId())) {
            throw new IllegalArgumentException("Cannot transfer to yourself");
        }

        // Lock Ordering bảo vệ hệ thống khỏi Deadlock
        Wallet senderWallet;
        Wallet receiverWallet;
        if (sender.getId() < receiver.getId()) {
            senderWallet = getWalletForUpdate(sender.getId());
            receiverWallet = getWalletForUpdate(receiver.getId());
        } else {
            receiverWallet = getWalletForUpdate(receiver.getId());
            senderWallet = getWalletForUpdate(sender.getId());
        }

        if (senderWallet.getBalance().compareTo(request.getAmount()) < 0) {
            throw new InsufficientBalanceException("Insufficient balance");
        }

        senderWallet.setBalance(senderWallet.getBalance().subtract(request.getAmount()));
        receiverWallet.setBalance(receiverWallet.getBalance().add(request.getAmount()));

        walletRepository.save(senderWallet);
        walletRepository.save(receiverWallet);

        Transaction transaction = Transaction.builder()
                .transactionCode(transactionCodeGenerator.generate())
                .senderUserId(sender.getId())
                .receiverUserId(receiver.getId())
                .amount(request.getAmount())
                .fee(BigDecimal.ZERO)
                .type(TransactionType.TRANSFER)
                .status(TransactionStatus.SUCCESS)
                .description(request.getDescription())
                .build();

        transactionRepository.save(transaction);

        return TransferResponse.builder()
                .transactionCode(transaction.getTransactionCode())
                .senderPhone(sender.getPhone())
                .receiverPhone(receiver.getPhone())
                .amount(request.getAmount())
                .senderBalance(senderWallet.getBalance())
                .receiverBalance(receiverWallet.getBalance())
                .build();
    }

    private void validatePin(User sender, String rawPin) {
        if (sender.getPin() == null) {
            throw new InvalidPinException("Please create transaction PIN first");
        }
        if (!passwordEncoder.matches(rawPin, sender.getPin())) {
            throw new InvalidPinException("Invalid transaction PIN");
        }
    }

    private Wallet getWalletForUpdate(Long userId) {
        return walletRepository.findByUserIdForUpdate(userId)
                .orElseThrow(() -> new NotFoundException("Wallet not found for user: " + userId));
    }
}