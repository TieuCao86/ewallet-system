package com.ewallet.module.wallet.controller;

import com.ewallet.module.wallet.dto.UserDashboardSummaryResponse;
import com.ewallet.module.wallet.service.UserDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/wallets")
@RequiredArgsConstructor
public class UserDashboardController {

    private final UserDashboardService userDashboardService;

    @GetMapping("/dashboard")
    public ResponseEntity<UserDashboardSummaryResponse> getDashboardSummary(
            @AuthenticationPrincipal Object principal // Thay 'Object' bằng class Custom UserDetails của hệ thống bạn (ví dụ: UserPrincipal)
    ) {
        // Giả định bạn có hàm getUserId() từ đối tượng Principal sau khi phân tích JWT thành công
        Long userId = 1L; // Đổi dòng này thành: principal.getId();

        UserDashboardSummaryResponse response = userDashboardService.getUserSummary(userId);
        return ResponseEntity.ok(response);
    }
}