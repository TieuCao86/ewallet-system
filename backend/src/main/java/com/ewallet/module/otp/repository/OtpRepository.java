package com.ewallet.module.otp.repository;

import com.ewallet.module.otp.entity.Otp;
import com.ewallet.module.otp.enums.OtpType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Optional;

public interface OtpRepository extends JpaRepository<Otp, Long> {

    Optional<Otp> findByPhoneAndTypeAndUsedFalse(String phone, OtpType type);

    void deleteByExpiryTimeBefore(LocalDateTime now);
}