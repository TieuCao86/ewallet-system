package com.ewallet.module.bank.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class BankMasterResponse {

    private Long id;
    private String code;
    private String name;
    private String logo;
}