package com.ewallet.module.kyc.controller;

import com.ewallet.module.kyc.dto.KycRequest;
import com.ewallet.module.kyc.dto.KycResponse;
import com.ewallet.module.kyc.service.KycService;
import com.ewallet.module.user.entity.User;
import com.ewallet.module.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/kyc")
@RequiredArgsConstructor
public class KycController {

    private final KycService kycService;
    private final UserService userService;

    @PostMapping
    public KycResponse submit(
            Authentication auth,
            @Valid @RequestBody KycRequest request
    ) {

        User user = userService.getByEmail(auth.getName());

        return kycService.submitKyc(user.getId(), request);
    }

    @GetMapping
    public KycResponse get(Authentication auth) {

        User user = userService.getByEmail(auth.getName());

        return kycService.getKyc(user.getId());
    }
}
