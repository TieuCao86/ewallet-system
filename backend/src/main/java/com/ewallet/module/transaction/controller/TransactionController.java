package com.ewallet.module.transaction.controller;

import com.ewallet.common.dto.ApiResponse;
import com.ewallet.module.transaction.dto.TransactionResponse;
import com.ewallet.module.transaction.dto.TransferRequest;
import com.ewallet.module.transaction.dto.TransferResponse;
import com.ewallet.module.transaction.service.TransactionService;
import com.ewallet.security.principal.UserPrincipal;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class TransactionController {

    private final TransactionService transactionService;

    @GetMapping
    public ApiResponse<Page<TransactionResponse>> getTransactions(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        // Ưu tiên lấy trực tiếp ID phẳng từ Principal token context
        Long userId = userPrincipal.getUser().getId();
        return ApiResponse.success(
                "Lấy danh sách giao dịch thành công",
                transactionService.getTransactions(userId, page, size)
        );
    }

    @GetMapping("/history")
    public ApiResponse<List<TransactionResponse>> getHistory(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        Long userId = userPrincipal.getUser().getId();
        return ApiResponse.success(
                "Lấy lịch sử giao dịch thành công",
                transactionService.getHistory(userId)
        );
    }

    /**
     * BƯỚC 1: Khởi tạo giao dịch chuyển tiền & Gửi OTP
     */
    @PostMapping("/transfer/initiate")
    public ApiResponse<Void> initiateTransfer(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody TransferRequest request
    ) {
        Long senderId = userPrincipal.getUser().getId();
        transactionService.initiateTransfer(senderId, request);
        return ApiResponse.success("Mã xác thực OTP đã được gửi đến số điện thoại của bạn.");
    }

    /**
     * BƯỚC 2: Xác thực OTP & Hoàn tất giao dịch chuyển tiền
     */
    @PostMapping("/transfer/confirm")
    public ApiResponse<TransferResponse> confirmTransfer(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody TransferRequest request,
            @RequestParam String otp
    ) {
        Long senderId = userPrincipal.getUser().getId();
        TransferResponse response = transactionService.confirmTransfer(senderId, request, otp);
        return ApiResponse.success("Giao dịch chuyển tiền thành công.", response);
    }
}