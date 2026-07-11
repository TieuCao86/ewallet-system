package com.ewallet.common.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum ErrorCode {
    // 1xx: Xác thực & Bảo mật (Authentication & Security)
    INVALID_CREDENTIALS(1001, "Tên đăng nhập hoặc mật khẩu không chính xác", HttpStatus.UNAUTHORIZED),
    ACCOUNT_LOCKED(1002, "Tài khoản đã bị khóa. Vui lòng liên hệ hỗ trợ", HttpStatus.FORBIDDEN),
    ACCOUNT_DISABLED(1003, "Tài khoản chưa được kích hoạt hoặc bị vô hiệu hóa", HttpStatus.FORBIDDEN),
    INVALID_PIN(1004, "Mã PIN giao dịch không chính xác", HttpStatus.BAD_REQUEST),
    INVALID_OTP(1005, "Mã xác thực OTP không chính xác hoặc đã hết hạn", HttpStatus.BAD_REQUEST),

    // 2xx: Khách hàng (User Module)
    USER_NOT_FOUND(2001, "Không tìm thấy thông tin người dùng", HttpStatus.NOT_FOUND),
    EMAIL_ALREADY_EXISTS(2002, "Địa chỉ email đã được đăng ký trên hệ thống", HttpStatus.BAD_REQUEST),
    PHONE_ALREADY_EXISTS(2003, "Số điện thoại đã được đăng ký trên hệ thống", HttpStatus.BAD_REQUEST),
    KYC_REQUIRED(2004, "Tài khoản chưa hoàn tất định danh (KYC)", HttpStatus.FORBIDDEN),

    // 3xx: Tài chính & Ví (Wallet & Transaction Core)
    WALLET_NOT_FOUND(3001, "Không tìm thấy thông tin ví điện tử", HttpStatus.NOT_FOUND),
    INSUFFICIENT_BALANCE(3002, "Số dư tài khoản không đủ để thực hiện giao dịch", HttpStatus.BAD_REQUEST),
    BANK_ACCOUNT_NOT_FOUND(3003, "Không tìm thấy thông tin tài khoản ngân hàng liên kết", HttpStatus.NOT_FOUND),
    TRANSACTION_NOT_FOUND(3004, "Không tìm thấy thông tin giao dịch", HttpStatus.NOT_FOUND),
    TRANSACTION_LIMIT_EXCEEDED(3005, "Giao dịch vượt quá hạn mức cho phép", HttpStatus.BAD_REQUEST),

    // 4xx & 5xx: Hệ thống chung (System Defaults)
    VALIDATION_ERROR(4000, "Dữ liệu đầu vào không hợp lệ", HttpStatus.BAD_REQUEST),
    RESOURCE_NOT_FOUND(4004, "Tài nguyên yêu cầu không tồn tại", HttpStatus.NOT_FOUND),
    INTERNAL_SERVER_ERROR(5000, "Có lỗi xảy ra từ hệ thống. Vui lòng thử lại sau", HttpStatus.INTERNAL_SERVER_ERROR);

    private final int code;
    private final String message;
    private final HttpStatus httpStatus;
}