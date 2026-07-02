package com.ewallet.module.bank.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class LinkBankResponse {

    private Long id;

    private String bankCode;

    private String bankName;

    private String accountNumber;

    private String accountHolder;
}
