package com.ewallet.module.dashboard.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BannerResponse {
    private Long id;
    private String title;
    private String imageUrl;
    private String redirectUrl;
}