package com.ewallet.module.kyc.entity;

import com.ewallet.common.entity.BaseEntity;
import com.ewallet.module.kyc.enums.KycStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "kyc")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Kyc extends BaseEntity {

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    @Column(length = 12)
    private String identityNumber;

    private String address;

    private LocalDate dateOfBirth;

    // CCCD images
    private String frontImageUrl;
    private String backImageUrl;

    // Face image (selfie)
    private String selfieUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private KycStatus status;
}
