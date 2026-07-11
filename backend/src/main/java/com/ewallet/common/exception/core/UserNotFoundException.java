package com.ewallet.common.exception.core;

import com.ewallet.common.exception.BusinessException;
import com.ewallet.common.exception.ErrorCode;

public class UserNotFoundException extends BusinessException {
    public UserNotFoundException() {
        super(ErrorCode.USER_NOT_FOUND);
    }
    public UserNotFoundException(Object identifier) {
        super(ErrorCode.USER_NOT_FOUND, ErrorCode.USER_NOT_FOUND.getMessage(), "User không tồn tại với định danh: " + identifier);
    }
}