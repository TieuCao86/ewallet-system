package com.ewallet.module.bank.dto;

import com.ewallet.module.bank.enums.BankCode;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class BankResponse {

    private Long id;

    private BankCode bankCode;

    private String bankName;

    private String accountNumber;

    private String accountHolder;

    private BigDecimal balance;
}
