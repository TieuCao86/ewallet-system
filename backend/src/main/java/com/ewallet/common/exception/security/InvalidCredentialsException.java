package com.ewallet.common.exception.security;

import com.ewallet.common.exception.BusinessException;
import com.ewallet.common.exception.ErrorCode;

public class InvalidCredentialsException extends BusinessException {
    public InvalidCredentialsException() {
        super(ErrorCode.INVALID_CREDENTIALS);
    }

    public InvalidCredentialsException(String logDetails) {
        super(ErrorCode.INVALID_CREDENTIALS, ErrorCode.INVALID_CREDENTIALS.getMessage(), logDetails);
    }
}