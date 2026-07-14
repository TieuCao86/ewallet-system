package com.ewallet.module.dashboard.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
public class FinancialStatsResponse {
    // Lưu cấu trúc dạng Map: Key là số tháng (ví dụ: 5, 6, 7), Value là cục Data Thu/Chi
    private Map<Integer, MonthData> history;

    @Data
    @Builder
    public static class MonthData {
        private String label;
        private BigDecimal income;
        private BigDecimal expense;
    }
}