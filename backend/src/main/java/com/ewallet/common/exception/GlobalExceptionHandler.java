package com.ewallet.common.exception;

import com.ewallet.common.dto.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // 1. Lỗi Validate dữ liệu đầu vào từ DTO (@Valid)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidationException(MethodArgumentNotValidException ex) {
        String errorMessage = ex.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining(", "));

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(4000, errorMessage));
    }

    // 2. Lỗi Không tìm thấy tài nguyên (UserNotFound, WalletNotFound, BankNotFound...)
    @ExceptionHandler({NotFoundException.class, UserNotFoundException.class, WalletNotFoundException.class})
    public ResponseEntity<ApiResponse<Void>> handleNotFoundException(RuntimeException ex) {
        int code = 4004; // Resource Not Found chung
        String msg = ex.getMessage() != null ? ex.getMessage().toLowerCase() : "";

        if (msg.contains("ví") || msg.contains("wallet")) {
            code = 3001; // Không tìm thấy ví
        } else if (msg.contains("người dùng") || msg.contains("user")) {
            code = 2001; // Không tìm thấy người dùng
        }

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(code, ex.getMessage()));
    }

    // 3. Lỗi Sai thông tin đăng nhập/Bảo mật
    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ApiResponse<Void>> handleInvalidCredentials(InvalidCredentialsException ex) {
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error(1001, ex.getMessage()));
    }

    // 4. Lỗi liên quan tới giao dịch mã PIN sai
    @ExceptionHandler(InvalidPinException.class)
    public ResponseEntity<ApiResponse<Void>> handleInvalidPinException(InvalidPinException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(1004, ex.getMessage())); // Mã lỗi sai PIN
    }

    // 5. Lỗi không đủ tiền trong tài khoản ví/ngân hàng
    @ExceptionHandler(InsufficientBalanceException.class)
    public ResponseEntity<ApiResponse<Void>> handleInsufficientBalance(InsufficientBalanceException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(3002, ex.getMessage())); // Mã lỗi hết tiền/Số dư không đủ
    }

    // 6. Lỗi Logic nghiệp vụ (Business Logic Exception)
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<Void>> handleBusinessBadRequestException(BusinessException ex) {
        int code = 4000;
        String msg = ex.getMessage() != null ? ex.getMessage().toLowerCase() : "";

        if (msg.contains("email")) {
            code = 2002; // Trùng địa chỉ email
        } else if (msg.contains("phone") || msg.contains("số điện thoại")) {
            code = 2003; // Trùng số điện thoại
        } else if (msg.contains("khóa") || msg.contains("locked")) {
            code = 1002; // Tài khoản bị khóa
        } else if (msg.contains("vô hiệu") || msg.contains("disabled")) {
            code = 1003; // Tài khoản bị vô hiệu hóa
        } else if (msg.contains("kyc")) {
            code = 5001; // Chưa hoàn tất KYC/Yêu cầu KYC
        }

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(code, ex.getMessage()));
    }

    // 7. Chốt chặn cuối cùng: Lỗi hệ thống không mong muốn (Lỗi 500)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGeneralException(Exception ex) {
        // Log lỗi ra console/file để Dev kiểm tra hệ thống nội bộ
        ex.printStackTrace();

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error(5000, "An unexpected error occurred. Please try again later."));
    }
}