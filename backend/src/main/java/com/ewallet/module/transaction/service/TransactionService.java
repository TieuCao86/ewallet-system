package com.ewallet.module.transaction.service;

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

    private final TransactionCodeGenerator transactionCodeGenerator;

    public Transaction createTopUpTransaction(
            Long userId,
            BigDecimal amount
    ) {

        Transaction transaction = Transaction.builder()
                .transactionCode(
                        transactionCodeGenerator.generate()
                )
                .senderUserId(userId)
                .amount(amount)
                .fee(BigDecimal.ZERO)
                .type(TransactionType.TOP_UP)
                .status(TransactionStatus.SUCCESS)
                .description("Wallet Top Up")
                .build();

        return transactionRepository.save(transaction);
    }

    public List<TransactionResponse> getHistory(Long userId){

        List<Transaction> transactions =
                transactionRepository
                        .findBySenderUserIdOrReceiverUserIdOrderByCreatedAtDesc(
                                userId,
                                userId
                        );

        return transactions.stream()
                .map(tx -> {

                    String direction = "SYSTEM";

                    if (tx.getType() == TransactionType.TRANSFER) {

                        if (userId.equals(tx.getSenderUserId())) {
                            direction = "SENT";
                        } else {
                            direction = "RECEIVED";
                        }
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
    public TransferResponse transfer(
            User sender,
            TransferRequest request
    ) {
        if (request.getAmount() == null
                || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {

            throw new RuntimeException(
                    "Amount must be greater than 0"
            );
        }

        User receiver = userRepository
                .findByPhone(request.getReceiverPhone())
                .orElseThrow(() ->
                        new RuntimeException("Receiver not found"));

        if (sender.getId().equals(receiver.getId())) {
            throw new RuntimeException(
                    "Cannot transfer to yourself"
            );
        }

        Wallet senderWallet = walletRepository
                .findByUserId(sender.getId())
                .orElseThrow(() ->
                        new RuntimeException("Sender wallet not found"));

        Wallet receiverWallet = walletRepository
                .findByUserId(receiver.getId())
                .orElseThrow(() ->
                        new RuntimeException("Receiver wallet not found"));

        if (senderWallet.getBalance()
                .compareTo(request.getAmount()) < 0) {

            throw new RuntimeException(
                    "Insufficient balance"
            );
        }

        senderWallet.setBalance(
                senderWallet.getBalance()
                        .subtract(request.getAmount())
        );

        receiverWallet.setBalance(
                receiverWallet.getBalance()
                        .add(request.getAmount())
        );

        String transactionCode =
                transactionCodeGenerator.generate();

        Transaction transaction =
                Transaction.builder()
                        .transactionCode(transactionCode)
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
                .transactionCode(transactionCode)
                .senderPhone(sender.getPhone())
                .receiverPhone(receiver.getPhone())
                .amount(request.getAmount())
                .senderBalance(senderWallet.getBalance())
                .receiverBalance(receiverWallet.getBalance())
                .build();
    }
}