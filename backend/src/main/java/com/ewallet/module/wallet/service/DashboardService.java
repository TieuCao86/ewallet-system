package com.ewallet.module.wallet.service;

import com.ewallet.module.wallet.dto.DashboardResponse;
import com.ewallet.module.kyc.service.KycService;
import com.ewallet.module.transaction.repository.TransactionRepository;
import com.ewallet.module.user.entity.User;
import com.ewallet.module.user.service.UserService;
import com.ewallet.module.wallet.entity.Wallet;
import com.ewallet.module.wallet.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserService userService;
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final KycService kycService;

    @Transactional(readOnly = true)
    public DashboardResponse getUserDashboard(Long userId) {
        User user = userService.getById(userId);
        Wallet wallet = walletRepository.findWalletByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Wallet not found"));

        // 1. Tính toán mốc thời gian tháng này
        YearMonth thisMonth = YearMonth.now();
        LocalDateTime startOfThisMonth = thisMonth.atDay(1).atStartOfDay();
        LocalDateTime endOfThisMonth = thisMonth.atEndOfMonth().atTime(LocalTime.MAX);

        // 2. Tính toán mốc thời gian tháng trước
        YearMonth prevMonth = thisMonth.minusMonths(1);
        LocalDateTime startOfPrevMonth = prevMonth.atDay(1).atStartOfDay();
        LocalDateTime endOfPrevMonth = prevMonth.atEndOfMonth().atTime(LocalTime.MAX);

        // 3. Query tính tổng tiền từ Repository (Tận dụng các hàm có sẵn của bạn)
        BigDecimal monthExpense = transactionRepository.sumExpenseByUserIdAndPeriod(userId, startOfThisMonth, endOfThisMonth);
        BigDecimal monthIncome = transactionRepository.sumIncomeByUserIdAndPeriod(userId, startOfThisMonth, endOfThisMonth);

        BigDecimal prevMonthExpense = transactionRepository.sumExpenseByUserIdAndPeriod(userId, startOfPrevMonth, endOfPrevMonth);
        BigDecimal prevMonthIncome = transactionRepository.sumIncomeByUserIdAndPeriod(userId, startOfPrevMonth, endOfPrevMonth);

        // 4. Đóng gói DTO tổng hợp
        return DashboardResponse.builder()
                .fullName(user.getFullName())
                .email(user.getEmail())
                .kycStatus(kycService.getKycStatus(userId))
                .walletNumber(wallet.getWalletNumber())
                .balance(wallet.getBalance())
                .monthExpense(monthExpense)
                .monthIncome(monthIncome)
                .prevMonthExpense(prevMonthExpense)
                .prevMonthIncome(prevMonthIncome)
                .build();
    }
}
