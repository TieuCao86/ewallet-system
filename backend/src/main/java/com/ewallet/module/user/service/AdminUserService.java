package com.ewallet.module.user.service;

import com.ewallet.module.user.dto.AdminProfileResponse;
import com.ewallet.module.user.dto.UserProfileResponse;

public interface AdminUserService {
    public Iterable<AdminProfileResponse> findAll();
}
