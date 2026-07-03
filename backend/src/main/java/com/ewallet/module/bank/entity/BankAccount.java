package com.ewallet.module.bank.entity;

import com.ewallet.common.entity.BaseEntity;
import com.ewallet.module.bank.enums.BankStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "bank_accounts")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BankAccount extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Chủ sở hữu ví
    @Column(nullable = false)
    private Long userId;

    // Ngân hàng liên kết
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bank_id", nullable = false)
    private Bank bank;

    @Column(nullable = false, unique = true, length = 20)
    private String accountNumber;

    @Column(nullable = false, length = 100)
    private String accountHolder;

    @Column(nullable = false, length = 20)
    private String phone;

    // Chỉ dùng để mô phỏng
    @Builder.Default
    @Column(nullable =false, precision = 19, scale = 2)
    private BigDecimal balance = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false)
    private BankStatus status = BankStatus.ACTIVE;
}