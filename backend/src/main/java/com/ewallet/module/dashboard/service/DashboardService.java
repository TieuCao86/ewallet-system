package com.ewallet.module.dashboard.service;

import com.ewallet.common.exception.core.WalletNotFoundException;
import com.ewallet.module.dashboard.dto.BannerResponse;
import com.ewallet.module.dashboard.dto.DashboardResponse;
import com.ewallet.module.dashboard.dto.FinancialStatsResponse;
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
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final KycService kycService;

    @Transactional(readOnly = true)
    public DashboardResponse getUserDashboard(User user) {
        Long userId = user.getId();

        Wallet wallet = walletRepository.findWalletByUserId(userId)
                .orElseThrow(() -> new WalletNotFoundException(userId));

        List<BannerResponse> staticBanners = List.of(
                BannerResponse.builder().id(1L).title("Hoàn tiền 50k khi liên kết VCB").imageUrl("https://...").redirectUrl("/link-bank").build(),
                BannerResponse.builder().id(2L).title("Miễn phí chuyển tiền").imageUrl("https://...").redirectUrl("/transfer").build()
        );

        return DashboardResponse.builder()
                .fullName(user.getFullName())
                .email(user.getEmail())
                .kycStatus(kycService.getKycStatus(userId))
                .walletNumber(wallet.getWalletNumber())
                .balance(wallet.getBalance())
                .marketingBanners(staticBanners)
                .build();
    }

    @Transactional(readOnly = true)
    public FinancialStatsResponse getFinancialStats(Long userId) {
        Map<Integer, FinancialStatsResponse.MonthData> historyMap = new HashMap<>();

        // 1. Xác định mốc thời gian bắt đầu của 3 tháng trước (Ví dụ: Đầu tháng 5 nếu hiện tại là tháng 7)
        YearMonth twoMonthsAgo = YearMonth.now().minusMonths(2);
        LocalDateTime startDate = twoMonthsAgo.atDay(1).atStartOfDay();

        // 2. Gọi Database 1 lần duy nhất lấy toàn bộ dữ liệu 3 tháng
        List<Object[]> rawStats = transactionRepository.getFinancialStatsGrouped(userId, startDate);

        // Chuyển dữ liệu từ DB thành một Map để dễ tra cứu theo số tháng
        Map<Integer, Object[]> dbDataMap = new HashMap<>();
        for (Object[] row : rawStats) {
            Integer month = (Integer) row[0];
            dbDataMap.put(month, row);
        }

        // 3. Đổ dữ liệu vào khung 3 tháng để đảm bảo Frontend luôn nhận đủ cấu trúc (kể cả tháng không có giao dịch)
        for (int i = 0; i < 3; i++) {
            YearMonth targetMonth = YearMonth.now().minusMonths(i);
            int monthValue = targetMonth.getMonthValue();

            BigDecimal income = BigDecimal.ZERO;
            BigDecimal expense = BigDecimal.ZERO;

            if (dbDataMap.containsKey(monthValue)) {
                Object[] row = dbDataMap.get(monthValue);
                income = (BigDecimal) row[1];
                expense = (BigDecimal) row[2];
            }

            historyMap.put(monthValue, FinancialStatsResponse.MonthData.builder()
                    .label("Tháng " + monthValue)
                    .income(income != null ? income : BigDecimal.ZERO)
                    .expense(expense != null ? expense : BigDecimal.ZERO)
                    .build());
        }

        return FinancialStatsResponse.builder().history(historyMap).build();
    }
}