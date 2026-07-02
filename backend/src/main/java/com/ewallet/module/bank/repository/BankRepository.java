package com.ewallet.module.bank.repository;

import com.ewallet.module.bank.entity.BankAccount;
import com.ewallet.module.bank.enums.BankCode;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BankRepository extends JpaRepository<BankAccount, Long> {

    List<BankAccount> findAllByUserId(Long userId);

    boolean existsByAccountNumber(String accountNumber);

    Optional<BankAccount> findByAccountNumber(String accountNumber);

    boolean existsByUserIdAndBankCode(Long userId, BankCode bankCode);

    Optional<BankAccount> findByIdAndUserId(Long id, Long userId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        select b
        from BankAccount b
        where b.id = :id
    """)
    Optional<BankAccount> findByIdForUpdate(Long id);
}