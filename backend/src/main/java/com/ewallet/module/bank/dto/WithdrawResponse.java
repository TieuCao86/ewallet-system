package com.ewallet.module.bank.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class WithdrawResponse {

    private BigDecimal amount;

    private BigDecimal walletBalance;

    private BigDecimal bankBalance;

    private String transactionCode;
}
