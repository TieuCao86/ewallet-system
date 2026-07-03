package com.ewallet.module.user.mapper;

import com.ewallet.module.kyc.enums.KycStatus;
import com.ewallet.module.user.dto.UserProfileResponse;
import com.ewallet.module.user.entity.User;

public class UserMapper {
    public static UserProfileResponse toDTO(User user, KycStatus kycStatus) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .kycStatus(kycStatus)
                .build();
    }
}
