package com.ewallet.module.kyc.service;

import com.ewallet.common.exception.BusinessException;
import com.ewallet.common.exception.NotFoundException;
import com.ewallet.module.kyc.dto.KycRequest;
import com.ewallet.module.kyc.dto.KycResponse;
import com.ewallet.module.kyc.entity.Kyc;
import com.ewallet.module.kyc.enums.KycStatus;
import com.ewallet.module.kyc.repository.KycRepository;
import com.ewallet.module.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class KycService {

    private final KycRepository kycRepository;

    @Transactional
    public KycResponse submitKyc(Long userId, KycRequest request) {

        Kyc kyc = kycRepository.findByUserId(userId)
                .orElseThrow(() ->
                        new NotFoundException("KYC not found"));

        kyc.setIdentityNumber(request.getIdentityNumber());
        kyc.setAddress(request.getAddress());
        kyc.setDateOfBirth(request.getDateOfBirth());
        kyc.setFrontImageUrl(request.getFrontImageUrl());
        kyc.setBackImageUrl(request.getBackImageUrl());
        kyc.setSelfieUrl(request.getSelfieUrl());

        // gửi lại thì quay về Pending
        kyc.setStatus(KycStatus.PENDING);

        return toResponse(kyc);
    }

    @Transactional(readOnly = true)
    public KycResponse getKyc(Long userId) {
        Kyc kyc = kycRepository.findByUserId(userId)
                .orElseThrow(() -> new NotFoundException("KYC data not found"));
        return toResponse(kyc);
    }

    @Transactional(readOnly = true)
    public void validateKycApproval(Long userId) {

        Kyc kyc = kycRepository.findByUserId(userId)
                .orElseThrow(() ->
                        new BusinessException("KYC_REQUIRED"));

        if (kyc.getStatus() != KycStatus.APPROVED) {
            throw new BusinessException("KYC_REQUIRED");
        }
    }

    @Transactional(readOnly = true)
    public KycStatus getKycStatus(Long userId) {

        return kycRepository.findByUserId(userId)
                .map(Kyc::getStatus)
                .orElseThrow(() ->
                        new NotFoundException("KYC not found"));
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

    private KycResponse toResponse(Kyc kyc) {
        return KycResponse.builder()
                .identityNumber(kyc.getIdentityNumber())
                .address(kyc.getAddress())
                .dateOfBirth(kyc.getDateOfBirth())
                .frontImageUrl(kyc.getFrontImageUrl())
                .backImageUrl(kyc.getBackImageUrl())
                .selfieUrl(kyc.getSelfieUrl())
                .status(kyc.getStatus())
                .build();
    }
}