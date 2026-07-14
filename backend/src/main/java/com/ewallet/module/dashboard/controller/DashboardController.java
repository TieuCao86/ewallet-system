package com.ewallet.module.dashboard.controller;

import com.ewallet.common.dto.ApiResponse;
import com.ewallet.module.user.entity.User;
import com.ewallet.module.dashboard.dto.DashboardResponse;
import com.ewallet.module.dashboard.dto.FinancialStatsResponse;
import com.ewallet.module.dashboard.service.DashboardService;
import com.ewallet.security.principal.UserPrincipal;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class DashboardController {

    private final DashboardService dashboardService;

    // Endpoint: GET /api/dashboard
    @GetMapping
    public ApiResponse<DashboardResponse> getDashboard(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        User currentUser = userPrincipal.getUser();
        return ApiResponse.success("Dashboard data retrieved successfully", dashboardService.getUserDashboard(currentUser));
    }

    @GetMapping("/financials")
    public ApiResponse<FinancialStatsResponse> getFinancials(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        User currentUser = userPrincipal.getUser();

        FinancialStatsResponse stats = dashboardService.getFinancialStats(currentUser.getId());

        return ApiResponse.success("Financial statistics retrieved successfully", stats);
    }
}