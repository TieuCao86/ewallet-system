package com.ewallet.module.user.service;

import com.ewallet.common.exception.BusinessException;
import com.ewallet.common.exception.InvalidCredentialsException;
import com.ewallet.common.exception.UserNotFoundException;
import com.ewallet.module.kyc.entity.Kyc;
import com.ewallet.module.kyc.service.KycService;
import com.ewallet.module.user.dto.*;
import com.ewallet.module.user.entity.User;
import com.ewallet.module.kyc.enums.KycStatus;
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
    private final KycService kycService;

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

        return toUserProfile(savedUser, KycStatus.PENDING);
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UserNotFoundException("User not found"));

        KycStatus status = kycService.getKycStatus(user.getId());

        return toUserProfile(user, status);
    }

    @Transactional
    public UserProfileResponse updateProfile(
            User user,
            UpdateProfileRequest request
    ) {

        user.setFullName(request.getFullName());

        return toUserProfile(
                user,
                kycService.getKycStatus(user.getId())
        );
    }

    @Transactional
    public void changePassword(
            User user,
            ChangePasswordRequest request
    ) {

        if (!passwordEncoder.matches(
                request.getOldPassword(),
                user.getPassword()
        )) {

            throw new InvalidCredentialsException(
                    "Old password is incorrect"
            );
        }

        if (!request.getNewPassword()
                .equals(request.getConfirmPassword())) {

            throw new InvalidCredentialsException(
                    "Password confirmation does not match"
            );
        }

        if (passwordEncoder.matches(
                request.getNewPassword(),
                user.getPassword()
        )) {

            throw new InvalidCredentialsException(
                    "New password must be different from old password"
            );
        }

        user.setPassword(
                passwordEncoder.encode(
                        request.getNewPassword()
                )
        );
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
    }

    private UserProfileResponse toUserProfile(
            User user,
            KycStatus kycStatus
    ) {

        return UserProfileResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .status(user.getStatus())
                .kycStatus(kycStatus)
                .build();
    }

    @Transactional(readOnly = true)
    public boolean existsByEmail(String email){
        return userRepository.existsByEmail(email);
    }

    @Transactional(readOnly = true)
    public boolean existsByPhone(String phone){
        return userRepository.existsByPhone(phone);
    }
}