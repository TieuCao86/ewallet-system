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

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private final WalletService walletService;

    public User register(RegisterRequest request){

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

        walletService.createWallet(savedUser.getId());

        return savedUser;
    }

    public User getByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public void createPin(
            User user,
            CreatePinRequest request
    ) {

        if (user.getPin() != null) {
            throw new RuntimeException("PIN already exists");
        }

        if (!request.getPin().equals(request.getConfirmPin())) {
            throw new RuntimeException("PIN confirmation does not match");
        }

        user.setPin(
                passwordEncoder.encode(request.getPin())
        );

        userRepository.save(user);
    }

    public void changePin(
            User user,
            ChangePinRequest request
    ) {

        if (!passwordEncoder.matches(
                request.getOldPin(),
                user.getPin())) {

            throw new RuntimeException("Old PIN is incorrect");
        }

        if (!request.getNewPin()
                .equals(request.getConfirmPin())) {

            throw new RuntimeException("PIN confirmation does not match");
        }

        user.setPin(
                passwordEncoder.encode(
                        request.getNewPin()
                )
        );

        userRepository.save(user);
    }
}