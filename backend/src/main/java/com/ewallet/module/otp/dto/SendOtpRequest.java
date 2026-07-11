package com.ewallet.module.otp.dto;

import com.ewallet.module.otp.enums.OtpType;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SendOtpRequest {

    private OtpType type;

}