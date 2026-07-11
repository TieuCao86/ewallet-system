package com.ewallet.common.exception.core;

import com.ewallet.common.exception.BusinessException;
import com.ewallet.common.exception.ErrorCode;

public class WalletNotFoundException extends BusinessException {
    public WalletNotFoundException() {
        super(ErrorCode.WALLET_NOT_FOUND);
    }
    public WalletNotFoundException(Object identifier) {
        super(ErrorCode.WALLET_NOT_FOUND, ErrorCode.WALLET_NOT_FOUND.getMessage(), "Ví không tồn tại với định danh/userId: " + identifier);
    }
}