package com.ewallet.module.user.dto;

import com.ewallet.module.kyc.enums.KycStatus;
import com.ewallet.module.user.enums.Role;
import com.ewallet.module.user.enums.UserStatus;
import lombok.Data;

@Data
public class AdminProfileResponse {
    private Long id;
    private String fullName;
    private String email;
    private String phone;

    private Role role;
    private UserStatus status;
}
