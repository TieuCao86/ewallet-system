package com.ewallet.module.transaction.entity;

import com.ewallet.common.entity.BaseEntity;
import com.ewallet.module.transaction.enums.TransactionStatus;
import com.ewallet.module.transaction.enums.TransactionType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String transactionCode;

    @Column
    private Long senderUserId;

    private Long receiverUserId;

    @Column(nullable = false, length = 100)
    private String senderName;

    @Column(length = 100)
    private String receiverName;

    @Column(nullable = false, length = 15)
    private String senderPhone;

    @Column(length = 15)
    private String receiverPhone;

    @Column
    private Long bankId;

    @Column
    private Long bankAccountId;

    @Column(length = 100)
    private String bankNameSnapshot;

    @Column(length = 50)
    private String bankAccountNumberSnapshot;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, precision = 19, scale = 2)
    @Builder.Default
    private BigDecimal fee = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TransactionType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TransactionStatus status;

    @Column(length = 255)
    private String description;
}