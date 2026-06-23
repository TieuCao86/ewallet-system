package com.ewallet.module.auth.service;

import com.ewallet.module.auth.dto.LoginRequest;
import com.ewallet.module.auth.dto.LoginResponse;
import com.ewallet.module.user.entity.User;
import com.ewallet.module.user.repository.UserRepository;
import com.ewallet.security.jwt.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public LoginResponse login(LoginRequest request){

        User user = userRepository
                .findByEmail(request.getEmail())
                .orElseThrow(
                        () -> new RuntimeException("User not found")
                );

        if(!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword()
        )){
            throw new RuntimeException("Wrong password");
        }

        user.setLastLogin(LocalDateTime.now());

        user.setFailedLoginAttempts(0);

        String token = jwtService.generateToken(user);

        return LoginResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .userId(user.getId())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }
}
