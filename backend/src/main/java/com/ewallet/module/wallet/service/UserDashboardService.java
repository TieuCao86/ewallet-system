package com.ewallet.module.wallet.service;

import com.ewallet.common.exception.NotFoundException;
import com.ewallet.module.transaction.repository.TransactionRepository;
import com.ewallet.module.user.entity.User;
import com.ewallet.module.user.repository.UserRepository;
import com.ewallet.module.wallet.entity.Wallet;
import com.ewallet.module.wallet.dto.UserDashboardSummaryResponse;
import com.ewallet.module.wallet.repository.WalletRepository;
import com.ewallet.module.kyc.repository.KycRepository; // <-- Import repo mới
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserDashboardService {

    private final WalletRepository walletRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final KycRepository kycRepository; // <-- 1. Inject KycRepository

    public UserDashboardSummaryResponse getUserSummary(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Người dùng không tồn tại."));

        Wallet wallet = walletRepository.findWalletByUserId(userId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy ví."));

        // 2. Lấy trạng thái KYC từ bảng kyc, xử lý trường hợp chưa tạo hồ sơ kyc
        String kycStatusStr = kycRepository.findStatusByUserId(userId)
                .map(Enum::name)
                .orElse("UNVERIFIED");

        LocalDate now = LocalDate.now();
        LocalDateTime currentMonthStart = now.withDayOfMonth(1).atStartOfDay();
        LocalDateTime previousMonthStart = now.minusMonths(1).withDayOfMonth(1).atStartOfDay();
        LocalDateTime previousMonthEnd = currentMonthStart.minusNanos(1);

        BigDecimal currentExpense = transactionRepository.sumExpenseByUserIdAndPeriod(userId, currentMonthStart, LocalDateTime.now());
        BigDecimal previousExpense = transactionRepository.sumExpenseByUserIdAndPeriod(userId, previousMonthStart, previousMonthEnd);
        BigDecimal currentIncome = transactionRepository.sumIncomeByUserIdAndPeriod(userId, currentMonthStart, LocalDateTime.now());
        Long totalTxCount = transactionRepository.countAllByUserId(userId);

        BigDecimal expensePercent = BigDecimal.ZERO;
        if (previousExpense.compareTo(BigDecimal.ZERO) > 0) {
            expensePercent = currentExpense
                    .subtract(previousExpense)
                    .multiply(BigDecimal.valueOf(100))
                    .divide(previousExpense, 2, RoundingMode.HALF_UP);
        }

        return UserDashboardSummaryResponse.builder()
                .walletNumber(wallet.getWalletNumber())
                .balance(wallet.getBalance())
                .lastLogin(user.getLastLogin())
                .kycStatus(kycStatusStr)
                .monthExpense(currentExpense)
                .monthIncome(currentIncome)
                .expensePercent(expensePercent)
                .transactionCount(totalTxCount)
                .build();
    }
}