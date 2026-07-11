package com.ewallet.module.otp.entity;

import com.ewallet.common.entity.BaseEntity;
import com.ewallet.module.otp.enums.OtpType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "otps")
public class Otp extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 15)
    private String phone;

    @Column(nullable = false, length = 255)
    private String code; // Nên lưu mã đã hash

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OtpType type;

    @Column(nullable = false)
    private LocalDateTime expiryTime;

    @Column(nullable = false)
    private boolean used;

    @Column(nullable = false)
    private int attempts;
}