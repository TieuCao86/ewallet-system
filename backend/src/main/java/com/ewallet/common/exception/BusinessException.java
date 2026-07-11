package com.ewallet.common.exception;

import lombok.Getter;

@Getter
public class BusinessException extends RuntimeException {
    private final ErrorCode errorCode;
    private final String logMessage; // Dùng để ghi log nội bộ cho Developer trace bug

    public BusinessException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
        this.logMessage = errorCode.getMessage();
    }

    // Constructor cho phép truyền custom message hiển thị ra Client công khai
    public BusinessException(ErrorCode errorCode, String customClientMessage) {
        super(customClientMessage);
        this.errorCode = errorCode;
        this.logMessage = customClientMessage;
    }

    // Constructor chuẩn sản phẩm thật: message thân thiện ra ngoài, log chi tiết giữ lại bên trong
    public BusinessException(ErrorCode errorCode, String customClientMessage, String logMessage) {
        super(customClientMessage);
        this.errorCode = errorCode;
        this.logMessage = logMessage;
    }
}