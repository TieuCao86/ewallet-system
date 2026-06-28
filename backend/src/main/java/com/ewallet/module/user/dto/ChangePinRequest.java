package com.ewallet.module.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class ChangePinRequest {

    @NotBlank(message = "Old PIN is required")
    private String oldPin;

    @NotBlank(message = "New PIN is required")
    @Pattern(regexp = "^\\d{6}$", message = "New PIN must be exactly 6 digits")
    private String newPin;

    @NotBlank(message = "Confirm PIN is required")
    private String confirmPin;
}