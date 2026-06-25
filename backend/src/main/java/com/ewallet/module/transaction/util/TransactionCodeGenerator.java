package com.ewallet.module.transaction.util;

import org.springframework.stereotype.Component;

@Component
public class TransactionCodeGenerator {

    public String generate() {
        return "TXN" + System.currentTimeMillis();
    }
}