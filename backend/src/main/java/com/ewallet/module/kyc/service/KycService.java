package com.ewallet.module.kyc.service;

import com.ewallet.common.exception.BusinessException;
import com.ewallet.common.exception.ErrorCode;
import com.ewallet.module.kyc.dto.KycRequest;
import com.ewallet.module.kyc.dto.KycResponse;
import com.ewallet.module.kyc.entity.Kyc;
import com.ewallet.module.kyc.enums.KycStatus;
import com.ewallet.module.kyc.mapper.KycMapper;
import com.ewallet.module.kyc.repository.KycRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class KycService {

    private final KycRepository kycRepository;
    private final KycMapper kycMapper;

    @Transactional
    public KycResponse submitKyc(Long userId, KycRequest request) {
        Kyc kyc = kycRepository.findByUserId(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND,
                        "Không tìm thấy hồ sơ định danh tài khoản.",
                        "Không tồn tại bản ghi KYC cho User ID: " + userId));

        kyc.setIdentityNumber(request.getIdentityNumber());
        kyc.setAddress(request.getAddress());
        kyc.setDateOfBirth(request.getDateOfBirth());
        kyc.setFrontImageUrl(request.getFrontImageUrl());
        kyc.setBackImageUrl(request.getBackImageUrl());
        kyc.setSelfieUrl(request.getSelfieUrl());

        // Hồ sơ gửi lên (hoặc gửi lại) sẽ chuyển về trạng thái chờ duyệt
        kyc.setStatus(KycStatus.PENDING);

        return kycMapper.toResponse(kycRepository.save(kyc));
    }

    @Transactional
    public void createDefaultKyc(Long userId) {
        if (kycRepository.existsByUserId(userId)) {
            return;
        }

        Kyc kyc = Kyc.builder()
                .userId(userId)
                .status(KycStatus.PENDING)
                .build();

        kycRepository.save(kyc);
    }

    @Transactional(readOnly = true)
    public KycResponse getKyc(Long userId) {
        Kyc kyc = kycRepository.findByUserIdWithUser(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND,
                        "Không tìm thấy dữ liệu định danh.",
                        "Không tồn tại bản ghi KYC cho User ID: " + userId));
        return kycMapper.toResponse(kyc);
    }

    @Transactional(readOnly = true)
    public KycStatus getKycStatus(Long userId) {
        return kycRepository.findByUserId(userId)
                .map(Kyc::getStatus)
                .orElse(KycStatus.UNVERIFIED);
    }

    @Transactional(readOnly = true)
    public void validateKycApproval(Long userId) {
        Kyc kyc = kycRepository.findByUserId(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.KYC_REQUIRED,
                        ErrorCode.KYC_REQUIRED.getMessage(),
                        "Giao dịch bị chặn: Không tìm thấy bản ghi KYC cho User ID: " + userId));

        if (kyc.getStatus() != KycStatus.APPROVED) {
            throw new BusinessException(ErrorCode.KYC_REQUIRED,
                    ErrorCode.KYC_REQUIRED.getMessage(),
                    String.format("Giao dịch bị chặn: Tài khoản User ID %d có trạng thái KYC là %s (Yêu cầu APPROVED)", userId, kyc.getStatus()));
        }
    }
}