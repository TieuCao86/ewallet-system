package com.ewallet.module.bank.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum BankCode {

    VCB("Vietcombank"),
    BIDV("BIDV"),
    TCB("Techcombank"),
    ACB("Asia Commercial Bank"),
    TPB("TPBank");

    private final String bankName;
}