package com.ewallet.module.bank.repository;

import com.ewallet.module.bank.entity.BankAccount;
import com.ewallet.module.bank.enums.BankStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BankAccountRepository extends JpaRepository<BankAccount, Long> {

    List<BankAccount> findAllByUserId(Long userId);

    Optional<BankAccount> findByIdAndUserId(Long id, Long userId);

    boolean existsByUserIdAndBank_Id(Long userId, Long bankId);

    boolean existsByUserIdAndBank_IdAndStatus(
            Long userId,
            Long bankId,
            BankStatus status
    );

    boolean existsByBank_IdAndAccountNumber(
            Long bankId,
            String accountNumber
    );

    Optional<BankAccount> findByBank_IdAndAccountNumber(
            Long bankId,
            String accountNumber
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        select b
        from BankAccount b
        where b.id = :id
    """)
    Optional<BankAccount> findByIdForUpdate(Long id);
}