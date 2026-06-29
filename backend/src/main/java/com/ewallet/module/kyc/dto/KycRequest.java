package com.ewallet.module.kyc.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class KycRequest {

    @NotBlank(message = "Identity number is required")
    @Pattern(regexp = "^\\d{9}$|^\\d{12}$", message = "Identity number must be 9 digits (old ID) or 12 digits (CCCD)")
    private String identityNumber;

    @NotBlank(message = "Address is required")
    @Size(max = 500, message = "Address cannot exceed 500 characters")
    private String address;

    @NotNull(message = "Date of birth is required")
    @Past(message = "Date of birth must be a past date")
    // Bạn có thể tự custom thêm hàm check tuổi >= 15 hoặc >= 18 ở tầng Service
    private LocalDate dateOfBirth;

    @NotBlank(message = "Front identity image is required")
    private String frontImageUrl;

    @NotBlank(message = "Back identity image is required")
    private String backImageUrl;

    @NotBlank(message = "Selfie image is required")
    private String selfieUrl;
}