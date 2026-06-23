package com.ewallet.module.user.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserProfileResponse {

    private Long id;
    private String fullName;
    private String email;
    private String phone;

    private String role;
    private String status;
    private String kycStatus;
}