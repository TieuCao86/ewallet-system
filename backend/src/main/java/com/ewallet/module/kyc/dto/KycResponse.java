package com.ewallet.module.kyc.dto;

import com.ewallet.module.kyc.enums.KycStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class KycResponse {

    private String identityNumber;
    private String address;
    private LocalDate dateOfBirth;

    private String frontImageUrl;
    private String backImageUrl;
    private String selfieUrl;

    private KycStatus status;
}
