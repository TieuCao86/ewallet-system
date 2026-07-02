package com.ewallet.module.bank.entity;

import com.ewallet.common.entity.BaseEntity;
import com.ewallet.module.bank.enums.BankCode;
import com.ewallet.module.bank.enums.BankStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "bank_account")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BankAccount extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BankCode bankCode;

    @Column(nullable = false, unique = true, length = 20)
    private String accountNumber;

    @Column(nullable = false)
    private String accountHolder;

    @Column(nullable = false, length = 20)
    private String phone;

    @Builder.Default
    @Column(nullable = false)
    private BigDecimal balance = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private BankStatus status = BankStatus.ACTIVE;
}