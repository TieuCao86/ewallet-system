package com.ewallet.common.exception.core;

import com.ewallet.common.exception.BusinessException;
import com.ewallet.common.exception.ErrorCode;

public class TransactionNotFoundException extends BusinessException {
  public TransactionNotFoundException() {
    super(ErrorCode.TRANSACTION_NOT_FOUND);
  }
  public TransactionNotFoundException(String txCode) {
    super(ErrorCode.TRANSACTION_NOT_FOUND, ErrorCode.TRANSACTION_NOT_FOUND.getMessage(), "Mã giao dịch không tồn tại: " + txCode);
  }
}