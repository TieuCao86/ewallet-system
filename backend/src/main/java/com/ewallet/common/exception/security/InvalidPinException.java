package com.ewallet.common.exception.security;

import com.ewallet.common.exception.BusinessException;
import com.ewallet.common.exception.ErrorCode;

public class InvalidPinException extends BusinessException {
    public InvalidPinException() {
        super(ErrorCode.INVALID_PIN);
    }
    public InvalidPinException(String logDetails) {
        super(ErrorCode.INVALID_PIN, ErrorCode.INVALID_PIN.getMessage(), logDetails);
    }
}