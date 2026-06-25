package com.ewallet.module.wallet.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class TopUpResponse {

    private String walletNumber;

    private BigDecimal amount;

    private BigDecimal newBalance;

    private String transactionCode;
}