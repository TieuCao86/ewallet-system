package com.ewallet.module.dashboard.dto;

import com.ewallet.module.bank.dto.BankResponse;
import com.ewallet.module.kyc.enums.KycStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class DashboardResponse {
    // Thông tin tài khoản người dùng (User Profile Snapshot)
    private String fullName;
    private String email;
    private KycStatus kycStatus;

    // Thông tin ví
    private String walletNumber;
    private BigDecimal balance;

    // Các mảng dữ liệu phẳng tối ưu hiệu năng
    private List<BannerResponse> marketingBanners;
}