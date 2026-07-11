package com.ewallet.module.kyc.repository;

import com.ewallet.module.kyc.entity.Kyc;
import com.ewallet.module.kyc.enums.KycStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface KycRepository extends JpaRepository<Kyc, Long> {

    Optional<Kyc> findByUserId(Long userId);

    @Query(value = "SELECT k.* FROM kyc k INNER JOIN users u ON k.user_id = u.id WHERE k.user_id = :userId", nativeQuery = true)
    Optional<Kyc> findByUserIdWithUser(@Param("userId") Long userId);

    boolean existsByUserId(Long userId);
}