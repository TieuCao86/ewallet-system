package com.ewallet.module.user.service;

import com.ewallet.common.exception.*;
import com.ewallet.module.user.dto.*;
import com.ewallet.module.user.entity.User;
import com.ewallet.module.kyc.enums.KycStatus;
import com.ewallet.module.user.enums.Role;
import com.ewallet.module.user.enums.UserStatus;
import com.ewallet.module.user.mapper.UserMapper;
import com.ewallet.module.user.repository.UserRepository;
import com.ewallet.module.wallet.service.WalletService;
import com.ewallet.module.kyc.service.KycService;
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
    private final KycService kycService;
    private final UserMapper userMapper;

    @Transactional
    public UserProfileResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Email is already registered");
        }
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new BusinessException("Phone number is already registered");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .status(UserStatus.ACTIVE)
                .build();

        User savedUser = userRepository.save(user);
        walletService.createWallet(savedUser.getId());
        kycService.createDefaultKyc(savedUser.getId());

        return userMapper.toProfile(savedUser, KycStatus.PENDING);
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        KycStatus status = kycService.getKycStatus(user.getId());

        return userMapper.toProfile(user, status);
    }

    @Transactional
    public UserProfileResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        user.setFullName(request.getFullName());

        return userMapper.toProfile(user, kycService.getKycStatus(user.getId()));
    }

    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Old password is incorrect");
        }
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new InvalidCredentialsException("Password confirmation does not match");
        }
        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("New password must be different from old password");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
    }

    @Transactional
    public void createPin(String email, CreatePinRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        if (user.getPin() != null) {
            throw new IllegalStateException("PIN already exists");
        }
        if (!request.getPin().equals(request.getConfirmPin())) {
            throw new IllegalArgumentException("PIN confirmation does not match");
        }

        user.setPin(passwordEncoder.encode(request.getPin()));
    }

    @Transactional
    public void changePin(String email, ChangePinRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getOldPin(), user.getPin())) {
            throw new IllegalArgumentException("Old PIN is incorrect");
        }
        if (!request.getNewPin().equals(request.getConfirmPin())) {
            throw new IllegalArgumentException("PIN confirmation does not match");
        }

        user.setPin(passwordEncoder.encode(request.getNewPin()));
    }

    @Transactional(readOnly = true)
    public User getById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));
    }

    @Transactional(readOnly = true)
    public User getByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found"));
    }

    @Transactional(readOnly = true)
    public User getByPhone(String phone) {
        return userRepository.findByPhone(phone)
                .orElseThrow(() -> new NotFoundException("User not found"));
    }

    public void validatePin(User user, String rawPin) {
        if (user.getPin() == null) {
            throw new InvalidPinException("Please create transaction PIN first");
        }
        if (!passwordEncoder.matches(rawPin, user.getPin())) {
            throw new InvalidPinException("Invalid transaction PIN");
        }
    }

    @Transactional(readOnly = true)
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Transactional(readOnly = true)
    public boolean existsByPhone(String phone) {
        return userRepository.existsByPhone(phone);
    }
}