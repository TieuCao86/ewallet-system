package com.ewallet.common.exception.core;

import com.ewallet.common.exception.BusinessException;
import com.ewallet.common.exception.ErrorCode;

public class BankAccountNotFoundException extends BusinessException {
    public BankAccountNotFoundException() {
        super(ErrorCode.BANK_ACCOUNT_NOT_FOUND);
    }
    public BankAccountNotFoundException(Object identifier) {
        super(ErrorCode.BANK_ACCOUNT_NOT_FOUND, ErrorCode.BANK_ACCOUNT_NOT_FOUND.getMessage(), "Tài khoản ngân hàng không tồn tại: " + identifier);
    }
}