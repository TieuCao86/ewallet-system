package com.ewallet.module.user.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreatePinRequest {

    private String pin;

    private String confirmPin;
}