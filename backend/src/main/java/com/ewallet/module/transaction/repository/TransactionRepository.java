package com.ewallet.module.transaction.repository;

import com.ewallet.module.transaction.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TransactionRepository
        extends JpaRepository<Transaction, Long> {

    List<Transaction> findBySenderUserIdOrderByCreatedAtDesc(Long userId);

    List<Transaction> findByReceiverUserIdOrderByCreatedAtDesc(Long userId);
}