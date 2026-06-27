package com.ewallet.module.transaction.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class TransferRequest {

    @NotBlank
    private String receiverPhone;

    @NotNull
    @DecimalMin("1000")
    private BigDecimal amount;

    private String description;
    private String pin;
}