package com.ewallet.common.exception.security;

import com.ewallet.common.exception.BusinessException;
import com.ewallet.common.exception.ErrorCode;
import java.math.BigDecimal;

public class InsufficientBalanceException extends BusinessException {
    public InsufficientBalanceException() {
        super(ErrorCode.INSUFFICIENT_BALANCE);
    }
    public InsufficientBalanceException(BigDecimal balance, BigDecimal amount) {
        super(ErrorCode.INSUFFICIENT_BALANCE,
                ErrorCode.INSUFFICIENT_BALANCE.getMessage(),
                String.format("Số dư hiện tại (%s) nhỏ hơn số tiền giao dịch (%s)", balance, amount));
    }
}