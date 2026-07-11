package com.ewallet.module.otp.dto;

import com.ewallet.module.otp.enums.OtpType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VerifyOtpRequest {

    @NotBlank(message = "Phone is required")
    private String phone;

    @NotBlank(message = "OTP is required")
    @Pattern(regexp = "\\d{6}", message = "OTP must contain 6 digits")
    private String otp;

    private OtpType type;

}