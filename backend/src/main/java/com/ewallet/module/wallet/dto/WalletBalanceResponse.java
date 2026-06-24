package com.ewallet.module.wallet.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class WalletBalanceResponse {

    private String walletNumber;

    private BigDecimal balance;
}