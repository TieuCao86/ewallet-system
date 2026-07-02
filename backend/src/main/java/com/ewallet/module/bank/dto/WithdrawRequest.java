package com.ewallet.module.bank.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class WithdrawRequest {

    @NotNull(message = "Bank account is required")
    private Long bankId;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "1000.00", message = "Minimum withdrawal is 1,000 VND")
    @Digits(integer = 12, fraction = 2)
    private BigDecimal amount;

    @NotBlank(message = "PIN is required")
    @Pattern(
            regexp = "^\\d{6}$",
            message = "PIN must contain exactly 6 digits"
    )
    private String pin;
}