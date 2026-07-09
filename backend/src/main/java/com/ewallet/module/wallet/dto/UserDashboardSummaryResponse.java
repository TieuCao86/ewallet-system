package com.ewallet.module.wallet.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class UserDashboardSummaryResponse {
    private String walletNumber;
    private BigDecimal balance;
    private LocalDateTime lastLogin;
    private String kycStatus;
    private BigDecimal monthExpense;
    private BigDecimal monthIncome;
    private BigDecimal expensePercent;
    private Long transactionCount;
}