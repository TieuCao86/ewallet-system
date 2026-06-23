package com.ewallet.module.user.entity;

import com.ewallet.module.user.enums.KycStatus;
import com.ewallet.module.user.enums.Role;
import com.ewallet.module.user.enums.UserStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false, unique = true)
    private String phone;

    @Column(nullable = false)
    private String password;

    /**
     * PIN dùng cho giao dịch chuyển tiền
     */
    private String pin;

    /**
     * USER / ADMIN
     */
    @Enumerated(EnumType.STRING)
    private Role role;

    /**
     * ACTIVE / LOCKED / DISABLED
     */
    @Enumerated(EnumType.STRING)
    private UserStatus status;

    /**
     * PENDING / APPROVED / REJECTED
     */
    @Enumerated(EnumType.STRING)
    private KycStatus kycStatus;

    /**
     * Số lần đăng nhập sai
     */
    private Integer failedLoginAttempts;

    /**
     * Bật/tắt xác thực 2 lớp
     */
    private Boolean twoFactorEnabled;

    /**
     * Lần đăng nhập cuối
     */
    private LocalDateTime lastLogin;

    /**
     * Thời gian tạo tài khoản
     */
    private LocalDateTime createdAt;

    /**
     * Thời gian cập nhật gần nhất
     */
    private LocalDateTime updatedAt;
}