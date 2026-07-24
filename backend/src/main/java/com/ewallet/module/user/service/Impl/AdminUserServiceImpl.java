package com.ewallet.module.user.service.Impl;

import com.ewallet.module.user.dto.AdminProfileResponse;
import com.ewallet.module.user.dto.UserProfileResponse;
import com.ewallet.module.user.entity.User;
import com.ewallet.module.user.repository.AdminUserRepository;
import com.ewallet.module.user.service.AdminUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Service
public class AdminUserServiceImpl implements AdminUserService {

    @Autowired
    AdminUserRepository adminUserRepository;

    @Override
    public Iterable<AdminProfileResponse> findAll() {
        Iterable<User> users = adminUserRepository.findAll();
        ArrayList<AdminProfileResponse> adminProfileResponses = new ArrayList<>();
        users.forEach(user -> {;
            AdminProfileResponse adminProfileResponse = new AdminProfileResponse();
            adminProfileResponse.setId(user.getId());
            adminProfileResponse.setEmail(user.getEmail());
            adminProfileResponse.setFullName(user.getFullName());
            adminProfileResponse.setRole(user.getRole());
            adminProfileResponse.setStatus(user.getStatus());
            adminProfileResponses.add(adminProfileResponse);
        });
        return adminProfileResponses;
    }
}
