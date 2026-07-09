package com.ewallet.module.user.mapper;

import com.ewallet.module.kyc.enums.KycStatus;
import com.ewallet.module.user.dto.UserProfileResponse;
import com.ewallet.module.user.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "kycStatus", source = "kycStatus")
    UserProfileResponse toProfile(User user, KycStatus kycStatus);

}