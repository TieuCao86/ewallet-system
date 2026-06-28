package com.ewallet.module.auth.service;

import com.ewallet.common.exception.InvalidCredentialsException;
import com.ewallet.common.exception.UserNotFoundException;
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

    public String login(LoginRequest request){

        User user = userRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new InvalidCredentialsException(
                                "Wrong email or password"
                        ));

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword())) {

            throw new InvalidCredentialsException(
                    "Wrong email or password"
            );
        }

        user.setLastLogin(LocalDateTime.now());

        user.setFailedLoginAttempts(0);

        userRepository.save(user);

        return jwtService.generateToken(user);
    }
}
