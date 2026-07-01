package com.ewallet.module.transaction.dto;

import com.ewallet.module.transaction.enums.TransactionStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Builder
@Data
public class TransferResponse {

    private String transactionCode;

    private BigDecimal amount;

    private BigDecimal balance;

    private TransactionStatus status;

    private LocalDateTime createdAt;
}