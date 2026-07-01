package com.ewallet.module.transaction.dto;

import com.ewallet.module.transaction.enums.TransactionDirection;
import com.ewallet.module.transaction.enums.TransactionStatus;
import com.ewallet.module.transaction.enums.TransactionType;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class TransactionResponse {

    private String transactionCode;

    private BigDecimal amount;

    private BigDecimal fee;

    private TransactionType type;

    private TransactionStatus status;

    private String otherPartyName;

    private String description;

    private TransactionDirection direction;

    private LocalDateTime createdAt;
}