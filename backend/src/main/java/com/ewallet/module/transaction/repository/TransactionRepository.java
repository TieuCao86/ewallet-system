package com.ewallet.module.transaction.repository;

import com.ewallet.module.transaction.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface TransactionRepository
        extends JpaRepository<Transaction, Long> {

    List<Transaction>
    findBySenderUserIdOrReceiverUserIdOrderByCreatedAtDesc(
            Long senderUserId,
            Long receiverUserId
    );

    List<Transaction> findByReceiverUserIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.senderUserId = :userId AND t.type IN (com.ewallet.module.transaction.enums.TransactionType.TRANSFER, com.ewallet.module.transaction.enums.TransactionType.WITHDRAW) AND t.createdAt >= :start AND t.createdAt <= :end")
    BigDecimal sumExpenseByUserIdAndPeriod(@Param("userId") Long userId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.receiverUserId = :userId AND t.type = com.ewallet.module.transaction.enums.TransactionType.TOP_UP AND t.createdAt >= :start AND t.createdAt <= :end")
    BigDecimal sumIncomeByUserIdAndPeriod(@Param("userId") Long userId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COUNT(t) FROM Transaction t WHERE t.senderUserId = :userId OR t.receiverUserId = :userId")
    Long countAllByUserId(@Param("userId") Long userId);

    Page<Transaction> findBySenderUserIdOrReceiverUserId(
            Long senderUserId,
            Long receiverUserId,
            Pageable pageable
    );
}