package com.ewallet.module.transaction.service;

import com.ewallet.module.transaction.dto.TransactionResponse;
import com.ewallet.module.transaction.entity.Transaction;
import com.ewallet.module.transaction.enums.TransactionStatus;
import com.ewallet.module.transaction.enums.TransactionType;
import com.ewallet.module.transaction.repository.TransactionRepository;
import com.ewallet.module.transaction.util.TransactionCodeGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
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
                        .findBySenderUserIdOrderByCreatedAtDesc(userId);

        return transactions.stream()
                .map(tx -> TransactionResponse.builder()
                        .transactionCode(tx.getTransactionCode())
                        .amount(tx.getAmount())
                        .fee(tx.getFee())
                        .type(tx.getType())
                        .status(tx.getStatus())
                        .description(tx.getDescription())
                        .createdAt(tx.getCreatedAt())
                        .build())
                .toList();
    }
}