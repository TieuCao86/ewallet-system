package com.ewallet.security.service;

import com.ewallet.module.user.entity.User;
import com.ewallet.module.user.repository.UserRepository;
import com.ewallet.security.principal.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Cacheable(value = "user-details", key = "#email", sync = true)
    public UserDetails loadUserByUsername(String email) {

        System.out.println("=== LOAD USER FROM DATABASE ===");

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException("User not found"));

        return new UserPrincipal(user);
    }
}