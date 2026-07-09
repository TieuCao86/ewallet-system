package com.ewallet.module.kyc.mapper;

import com.ewallet.module.kyc.dto.KycResponse;
import com.ewallet.module.kyc.entity.Kyc;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface KycMapper {

    KycResponse toResponse(Kyc kyc);
}