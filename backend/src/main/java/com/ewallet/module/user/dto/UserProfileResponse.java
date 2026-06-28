package com.ewallet.module.user.dto;

import com.ewallet.module.user.enums.Role;
import com.ewallet.module.user.enums.UserStatus;
import com.ewallet.module.user.enums.KycStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserProfileResponse {

    private Long id;
    private String fullName;
    private String email;
    private String phone;

    private Role role;
    private UserStatus status;
    private KycStatus kycStatus;
}