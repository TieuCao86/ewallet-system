package com.ewallet.common.exception.security;

import com.ewallet.common.exception.BusinessException;
import com.ewallet.common.exception.ErrorCode;

public class InvalidOtpException extends BusinessException {
    public InvalidOtpException() {
        super(ErrorCode.INVALID_OTP);
    }

    public InvalidOtpException(String logDetails) {
        super(ErrorCode.INVALID_OTP, ErrorCode.INVALID_OTP.getMessage(), logDetails);
    }

    public InvalidOtpException(String customClientMessage, String logDetails) {
        super(ErrorCode.INVALID_OTP, customClientMessage, logDetails);
    }
}