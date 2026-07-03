package com.ewallet.module.user.controller;

import com.ewallet.module.user.dto.UserProfileResponse;
import com.ewallet.module.user.service.AdminUserService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {
    @Autowired
    AdminUserService adminUserService;

    @GetMapping
    public UserProfileResponse findAll() {
        return adminUserService.findAll();
    }
}
