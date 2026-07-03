package com.ewallet.module.bank.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BankResponse {

    private Long id;

    private Long bankId;

    private String bankName;

    private String accountNumber;

    private String accountHolder;

    private BigDecimal balance;
}
