package com.ewallet.module.user.entity;

import com.ewallet.common.entity.BaseEntity;
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
public class User extends BaseEntity {

    @Column(nullable = false, length = 100)
    private String fullName;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false, unique = true, length = 20)
    private String phone;

    @Column(nullable = false)
    private String password;

    /**
     * PIN giao dịch (nên lưu BCrypt sau này)
     */
    @Column(length = 255)
    private String pin;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Role role = Role.USER;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private UserStatus status = UserStatus.ACTIVE;

    @Column(nullable = false)
    @Builder.Default
    private Integer failedLoginAttempts = 0;

    @Column(nullable = false)
    @Builder.Default
    private Boolean twoFactorEnabled = false;

    private LocalDateTime lastLogin;
}