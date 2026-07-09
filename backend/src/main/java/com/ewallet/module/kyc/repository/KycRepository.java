package com.ewallet.module.kyc.repository;

import com.ewallet.module.kyc.entity.Kyc;
import com.ewallet.module.kyc.enums.KycStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface KycRepository extends JpaRepository<Kyc, Long> {

    Optional<Kyc> findByUserId(Long userId);

    @Query("SELECT k.status FROM Kyc k WHERE k.userId = :userId")
    Optional<KycStatus> findStatusByUserId(@Param("userId") Long userId);

    boolean existsByUserId(Long userId);
}