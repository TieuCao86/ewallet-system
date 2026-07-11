package com.ewallet.module.auth.service;

import com.ewallet.common.exception.security.InvalidCredentialsException;
import com.ewallet.module.auth.dto.LoginRequest;
import com.ewallet.module.auth.dto.LoginResponse;
import com.ewallet.module.user.entity.User;
import com.ewallet.module.user.repository.UserRepository;
import com.ewallet.security.jwt.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public LoginResponse login(LoginRequest request) {
        // Tìm kiếm user bằng email. Ghi nhận log nội bộ nếu email không tồn tại trong DB
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException(
                        String.format("Đăng nhập thất bại: Email %s không tồn tại trên hệ thống.", request.getEmail())
                ));

        // Kiểm tra tính chính xác của mật khẩu
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException(
                    String.format("Đăng nhập thất bại: User %s nhập sai mật khẩu.", request.getEmail())
            );
        }

        // Cập nhật trạng thái đăng nhập thành công
        user.setLastLogin(LocalDateTime.now());
        user.setFailedLoginAttempts(0);
        userRepository.save(user);

        // Khởi tạo chuỗi mã hóa bảo mật JWT Token
        String token = jwtService.generateToken(user);

        // Trả về DTO (Controller sẽ sử dụng token này để đóng gói vào HttpOnly Cookie an toàn)
        return LoginResponse.builder()
                .accessToken(token)
                .userId(user.getId())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }
}