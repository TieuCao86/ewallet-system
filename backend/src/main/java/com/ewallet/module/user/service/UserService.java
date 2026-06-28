package com.ewallet.module.user.service;

import com.ewallet.module.user.dto.ChangePinRequest;
import com.ewallet.module.user.dto.CreatePinRequest;
import com.ewallet.module.user.dto.RegisterRequest;
import com.ewallet.module.user.entity.User;
import com.ewallet.module.user.enums.KycStatus;
import com.ewallet.module.user.enums.Role;
import com.ewallet.module.user.enums.UserStatus;
import com.ewallet.module.user.repository.UserRepository;
import com.ewallet.module.wallet.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final WalletService walletService;

    @Transactional
    public User register(RegisterRequest request) {
        // Kiểm tra trùng lặp thông tin trước khi lưu
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already registered");
        }
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new IllegalArgumentException("Phone number is already registered");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .status(UserStatus.ACTIVE)
                .kycStatus(KycStatus.PENDING)
                .build();

        User savedUser = userRepository.save(user);

        // Bắt buộc phải bọc trong @Transactional để hành động này an toàn
        walletService.createWallet(savedUser.getId());

        return savedUser;
    }

    @Transactional(readOnly = true)
    public User getByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    @Transactional
    public void createPin(User user, CreatePinRequest request) {
        if (user.getPin() != null) {
            throw new IllegalStateException("PIN already exists");
        }

        if (!request.getPin().equals(request.getConfirmPin())) {
            throw new IllegalArgumentException("PIN confirmation does not match");
        }

        user.setPin(passwordEncoder.encode(request.getPin()));
        userRepository.save(user);
    }

    @Transactional
    public void changePin(User user, ChangePinRequest request) {
        if (!passwordEncoder.matches(request.getOldPin(), user.getPin())) {
            throw new IllegalArgumentException("Old PIN is incorrect");
        }

        if (!request.getNewPin().equals(request.getConfirmPin())) {
            throw new IllegalArgumentException("PIN confirmation does not match");
        }

        user.setPin(passwordEncoder.encode(request.getNewPin()));
        userRepository.save(user);
    }
}