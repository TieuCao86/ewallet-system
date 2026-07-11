package com.ewallet.module.user.service;

import com.ewallet.common.exception.*;
import com.ewallet.common.exception.core.UserNotFoundException;
import com.ewallet.common.exception.security.InvalidCredentialsException;
import com.ewallet.common.exception.security.InvalidPinException;
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
import org.springframework.cache.annotation.CacheEvict;
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
            throw new BusinessException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new BusinessException(ErrorCode.PHONE_ALREADY_EXISTS);
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
                .orElseThrow(() -> new UserNotFoundException(email));
        KycStatus status = kycService.getKycStatus(user.getId());

        return userMapper.toProfile(user, status);
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(User user) {
        KycStatus status = kycService.getKycStatus(user.getId());
        return userMapper.toProfile(user, status);
    }

    @Transactional
    @CacheEvict(value = "user-details", key = "#email")
    public UserProfileResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException(email));

        user.setFullName(request.getFullName());

        return userMapper.toProfile(user, kycService.getKycStatus(user.getId()));
    }

    @Transactional
    @CacheEvict(value = "user-details", key = "#email")
    public void changePassword(String email, ChangePasswordRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException(email));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new InvalidCredentialsException();
        }
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Mật khẩu xác nhận không khớp");
        }
        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Mật khẩu mới không được trùng với mật khẩu cũ");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
    }

    @Transactional
    @CacheEvict(value = "user-details", key = "#email")
    public void createPin(String email, CreatePinRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException(email));

        if (user.getPin() != null) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Tài khoản này đã được thiết lập mã PIN",
                    "User " + email + " cố gắng khởi tạo lại mã PIN khi đã tồn tại.");
        }
        if (!request.getPin().equals(request.getConfirmPin())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Mã PIN xác nhận không khớp");
        }

        user.setPin(passwordEncoder.encode(request.getPin()));
    }

    @Transactional
    @CacheEvict(value = "user-details", key = "#email")
    public void changePin(String email, ChangePinRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException(email));

        if (!passwordEncoder.matches(request.getOldPin(), user.getPin())) {
            throw new InvalidPinException("User " + email + " nhập sai mã PIN cũ khi thực hiện đổi PIN.");
        }
        if (!request.getNewPin().equals(request.getConfirmPin())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Mã PIN xác nhận không khớp");
        }

        user.setPin(passwordEncoder.encode(request.getNewPin()));
    }

    @Transactional(readOnly = true)
    public User getById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));
    }

    @Transactional(readOnly = true)
    public User getByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException(email));
    }

    @Transactional(readOnly = true)
    public User getByPhone(String phone) {
        return userRepository.findByPhone(phone)
                .orElseThrow(() -> new UserNotFoundException(phone));
    }

    public void validatePin(User user, String rawPin) {
        if (user.getPin() == null) {
            throw new InvalidPinException("User " + user.getEmail() + " chưa thiết lập mã PIN giao dịch.");
        }
        if (!passwordEncoder.matches(rawPin, user.getPin())) {
            throw new InvalidPinException("User " + user.getEmail() + " xác thực mã PIN thất bại.");
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