package com.ewallet.module.user.controller;

import com.ewallet.common.dto.ApiResponse;
import com.ewallet.module.user.dto.AdminProfileResponse;
import com.ewallet.module.user.dto.UserProfileResponse;
import com.ewallet.module.user.service.AdminUserService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {
    @Autowired
    AdminUserService adminUserService;
    @GetMapping
    public Iterable<AdminProfileResponse> findAll() {
        return adminUserService.findAll();
    }

}
