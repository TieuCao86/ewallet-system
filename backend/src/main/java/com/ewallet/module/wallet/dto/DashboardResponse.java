package com.ewallet.module.wallet.dto;

import com.ewallet.module.kyc.enums.KycStatus;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class DashboardResponse {
    // User Profile Snapshot
    private String fullName;
    private String email;
    private KycStatus kycStatus;

    // Wallet Information
    private String walletNumber;
    private BigDecimal balance;

    // Monthly Statistics (Dữ liệu động tháng này)
    private BigDecimal monthExpense;
    private BigDecimal monthIncome;

    // Historical Trend Statistics (Dữ liệu động tháng trước để so sánh % ở Frontend)
    private BigDecimal prevMonthExpense;
    private BigDecimal prevMonthIncome;
}