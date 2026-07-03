package com.ewallet.module.user.service.Impl;

import com.ewallet.module.user.dto.UserProfileResponse;
import com.ewallet.module.user.repository.AdminUserRepository;
import com.ewallet.module.user.service.AdminUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AdminUserServiceImpl implements AdminUserService {

    @Autowired
    AdminUserRepository adminUserRepository;

    @Override
    public UserProfileResponse findAll() {
        return null;
    }
}
