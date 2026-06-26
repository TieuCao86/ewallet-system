package com.ewallet.module.transaction.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Builder
@Data
public class TransferResponse {

    private String transactionCode;

    private String senderPhone;

    private String receiverPhone;

    private BigDecimal amount;

    private BigDecimal senderBalance;

    private BigDecimal receiverBalance;
}