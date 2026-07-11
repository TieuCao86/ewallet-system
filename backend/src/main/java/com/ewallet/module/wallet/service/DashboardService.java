package com.ewallet.module.wallet.service;

import com.ewallet.module.wallet.dto.DashboardResponse;
import com.ewallet.module.kyc.service.KycService;
import com.ewallet.module.transaction.repository.TransactionRepository;
import com.ewallet.module.user.entity.User;
import com.ewallet.module.wallet.entity.Wallet;
import com.ewallet.module.wallet.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final KycService kycService;

    @Transactional(readOnly = true)
    public DashboardResponse getUserDashboard(User user) {
        Long userId = user.getId();

        // 1. Lấy thông tin Ví từ userId
        Wallet wallet = walletRepository.findWalletByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Wallet not found"));

        // 2. Tính toán mốc thời gian tháng này
        YearMonth thisMonth = YearMonth.now();
        LocalDateTime startOfThisMonth = thisMonth.atDay(1).atStartOfDay();
        LocalDateTime endOfThisMonth = thisMonth.atEndOfMonth().atTime(LocalTime.MAX);

        // 3. Tính toán mốc thời gian tháng trước
        YearMonth prevMonth = thisMonth.minusMonths(1);
        LocalDateTime startOfPrevMonth = prevMonth.atDay(1).atStartOfDay();
        LocalDateTime endOfPrevMonth = prevMonth.atEndOfMonth().atTime(LocalTime.MAX);

        // 4. Thực hiện gom toàn bộ 4 phép tính SUM tài chính vào đúng 1 câu query
        List<Object[]> resultList = transactionRepository.getDashboardFinancials(
                userId, startOfThisMonth, endOfThisMonth, startOfPrevMonth, endOfPrevMonth
        );

        BigDecimal monthExpense = BigDecimal.ZERO;
        BigDecimal monthIncome = BigDecimal.ZERO;
        BigDecimal prevMonthExpense = BigDecimal.ZERO;
        BigDecimal prevMonthIncome = BigDecimal.ZERO;

        // Bóc tách mảng Object để gán giá trị an toàn
        if (resultList != null && !resultList.isEmpty()) {
            Object[] row = resultList.get(0);
            monthExpense = (BigDecimal) row[0];
            monthIncome = (BigDecimal) row[1];
            prevMonthExpense = (BigDecimal) row[2];
            prevMonthIncome = (BigDecimal) row[3];
        }

        // 5. Đóng gói DTO tổng hợp và trả về
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