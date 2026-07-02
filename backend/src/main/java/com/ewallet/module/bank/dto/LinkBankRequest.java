package com.ewallet.module.bank.dto;

import com.ewallet.module.bank.enums.BankCode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LinkBankRequest {

    @NotNull(message = "Bank is required")
    private BankCode bankCode;

    @NotBlank
    @Pattern(
            regexp = "^\\d{8,20}$",
            message = "Account number must contain 8-20 digits"
    )
    private String accountNumber;

    @NotBlank
    @Pattern(
            regexp = "^(0|\\+84)(3|5|7|8|9)\\d{8}$",
            message = "Invalid phone"
    )
    private String phone;
}