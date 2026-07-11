package com.ewallet.common.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {

    private boolean success;
    private String message;
    private T data;
    private Integer errorCode;   // Chỉ có khi success = false
    private LocalDateTime timestamp; // Tiện cho việc trace log lỗi theo thời gian
    private String path;         // API gây lỗi (ví dụ: /api/v1/transfer)

    // Khởi tạo thành công có dữ liệu
    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .build();
    }

    // Khởi tạo thành công không có dữ liệu (Void)
    public static ApiResponse<Void> success(String message) {
        return ApiResponse.<Void>builder()
                .success(true)
                .message(message)
                .build();
    }

    // Khởi tạo lỗi chuẩn sản phẩm thực tế
    public static ApiResponse<Void> error(int errorCode, String message, String path) {
        return ApiResponse.<Void>builder()
                .success(false)
                .message(message)
                .errorCode(errorCode)
                .timestamp(LocalDateTime.now()) // Tự động lấy thời gian hiện tại
                .path(path)
                .build();
    }
}