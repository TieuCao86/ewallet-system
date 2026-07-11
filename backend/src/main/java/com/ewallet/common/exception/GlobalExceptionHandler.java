package com.ewallet.common.exception;

import com.ewallet.common.dto.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    // 1. Đánh chặn toàn bộ lỗi Nghiệp vụ (BusinessException và các class con)
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<Void>> handleBusinessException(BusinessException ex, HttpServletRequest request) {
        ErrorCode errorCode = ex.getErrorCode();

        log.warn("[BUSINESS EXCEPTION] Code: {} | Path: {} | Internal Log: {}",
                errorCode.getCode(), request.getRequestURI(), ex.getLogMessage());

        return ResponseEntity
                .status(errorCode.getHttpStatus())
                .body(ApiResponse.error(errorCode.getCode(), ex.getMessage(), request.getRequestURI()));
    }

    // 2. Đánh chặn lỗi Validate định dạng đầu vào từ DTO (@Valid)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidationException(MethodArgumentNotValidException ex, HttpServletRequest request) {
        String errors = ex.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining(", "));

        log.warn("[VALIDATION FAILED] Path: {} | Details: {}", request.getRequestURI(), errors);

        return ResponseEntity
                .status(ErrorCode.VALIDATION_ERROR.getHttpStatus())
                .body(ApiResponse.error(ErrorCode.VALIDATION_ERROR.getCode(), errors, request.getRequestURI()));
    }

    // 3. Chốt chặn cuối cùng: Hệ thống sập, lỗi DB, NullPointerException (Lỗi 500)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGeneralException(Exception ex, HttpServletRequest request) {
        log.error("[CRITICAL SYSTEM ERROR] Path: {} | Uncaught exception occurred: ", request.getRequestURI(), ex);

        return ResponseEntity
                .status(ErrorCode.INTERNAL_SERVER_ERROR.getHttpStatus())
                .body(ApiResponse.error(ErrorCode.INTERNAL_SERVER_ERROR.getCode(), ErrorCode.INTERNAL_SERVER_ERROR.getMessage(), request.getRequestURI()));
    }
}