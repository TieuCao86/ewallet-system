package com.ewallet.module.otp.service;

import com.ewallet.common.exception.core.UserNotFoundException;
import com.ewallet.common.exception.security.InvalidOtpException;
import com.ewallet.module.otp.entity.Otp;
import com.ewallet.module.otp.enums.OtpType;
import com.ewallet.module.otp.repository.OtpRepository;
import com.ewallet.module.user.entity.User;
import com.ewallet.module.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.concurrent.ThreadLocalRandom;

@Slf4j
@Service
@RequiredArgsConstructor
public class OtpService {

    private static final int MAX_ATTEMPTS = 5;
    private static final int OTP_EXPIRE_MINUTES = 5;

    private final OtpRepository otpRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public void sendOtp(Long userId, OtpType type) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        String phone = user.getPhone();

        // Tạo mã OTP ngẫu nhiên gồm 6 chữ số
        String otp = String.valueOf(ThreadLocalRandom.current().nextInt(100000, 1000000));

        // Tái sử dụng bản ghi OTP cũ chưa dùng của số điện thoại này hoặc tạo mới hoàn toàn
        Otp entity = otpRepository
                .findByPhoneAndTypeAndUsedFalse(phone, type)
                .orElse(new Otp());

        entity.setPhone(phone);
        entity.setType(type);
        entity.setCode(passwordEncoder.encode(otp));
        entity.setExpiryTime(LocalDateTime.now().plusMinutes(OTP_EXPIRE_MINUTES));
        entity.setAttempts(0);
        entity.setUsed(false);

        otpRepository.save(entity); // Đã xóa dòng duplicate save dư thừa tại đây

        // Ở môi trường Production thực tế, log console sẽ bị tắt và gửi qua SMS Brandname
        log.info("============== OTP GENERATED ==============");
        log.info("Phone: {} | Type: {} | OTP Code: {}", phone, type, otp);
        log.info("===========================================");
    }

    @Transactional
    public boolean verifyOtp(Long userId, String otp, OtpType type) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        String phone = user.getPhone();

        Otp entity = otpRepository
                .findByPhoneAndTypeAndUsedFalse(phone, type)
                .orElseThrow(() -> new InvalidOtpException(String.format("Không tìm thấy OTP chưa sử dụng cho SĐT %s, loại %s", phone, type)));

        if (entity.getExpiryTime().isBefore(LocalDateTime.now())) {
            throw new InvalidOtpException("Mã xác thực OTP đã hết hạn.",
                    String.format("OTP của SĐT %s đã hết hạn lúc %s", phone, entity.getExpiryTime()));
        }

        if (entity.getAttempts() >= MAX_ATTEMPTS) {
            throw new InvalidOtpException("Mã OTP đã bị khóa do nhập sai quá nhiều lần. Vui lòng lấy mã mới.",
                    String.format("OTP của SĐT %s đã bị khóa từ trước do vượt quá số lần thử (%d)", phone, entity.getAttempts()));
        }

        if (!passwordEncoder.matches(otp, entity.getCode())) {
            // Tách biệt luồng cập nhật số lần thử độc lập để tránh bị rollback khi sai OTP
            incrementOtpAttempts(entity);

            int remainingAttempts = MAX_ATTEMPTS - entity.getAttempts();
            if (remainingAttempts <= 0) {
                throw new InvalidOtpException("Mã OTP đã bị khóa do nhập sai quá nhiều lần. Vui lòng lấy mã mới.",
                        String.format("User %s nhập sai OTP lần cuối cùng, OTP chính thức bị khóa.", phone));
            }

            throw new InvalidOtpException(
                    String.format("Mã OTP không chính xác. Bạn còn %d lần thử.", remainingAttempts),
                    String.format("User %s nhập sai OTP. Số lần thử hiện tại: %d/%d", phone, entity.getAttempts(), MAX_ATTEMPTS)
            );
        }

        entity.setUsed(true);
        otpRepository.save(entity);
        return true;
    }

    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void cleanExpiredOtp() {
        otpRepository.deleteByExpiryTimeBefore(LocalDateTime.now());
    }

    // Độc lập Transaction: Đảm bảo số lần nhập sai được lưu xuống DB kể cả khi transaction confirmTransfer bị lỗi
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void incrementOtpAttempts(Otp entity) {
        entity.setAttempts(entity.getAttempts() + 1);
        otpRepository.save(entity);
    }
}