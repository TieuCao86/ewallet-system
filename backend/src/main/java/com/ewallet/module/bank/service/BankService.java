package com.ewallet.module.bank.service;

import com.ewallet.common.exception.BusinessException;
import com.ewallet.common.exception.ErrorCode;
import com.ewallet.common.exception.core.BankAccountNotFoundException;
import com.ewallet.module.bank.dto.*;
import com.ewallet.module.bank.entity.Bank;
import com.ewallet.module.bank.entity.BankAccount;
import com.ewallet.module.bank.enums.BankStatus;
import com.ewallet.module.bank.mapper.BankMapper;
import com.ewallet.module.bank.repository.BankAccountRepository;
import com.ewallet.module.bank.repository.BankRepository;
import com.ewallet.module.otp.enums.OtpType;
import com.ewallet.module.otp.service.OtpService;
import com.ewallet.module.transaction.entity.Transaction;
import com.ewallet.module.transaction.repository.TransactionRepository;
import com.ewallet.module.transaction.service.TransactionService;
import com.ewallet.module.user.entity.User;
import com.ewallet.module.user.service.UserService;
import com.ewallet.module.wallet.dto.TopUpResponse;
import com.ewallet.module.wallet.entity.Wallet;
import com.ewallet.module.wallet.mapper.WalletMapper;
import com.ewallet.module.wallet.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BankService {

    private final BankRepository bankRepository;
    private final BankAccountRepository bankAccountRepository;
    private final TransactionRepository transactionRepository;

    private final WalletService walletService;
    private final TransactionService transactionService;
    private final UserService userService;
    private final OtpService otpService;

    private final BankMapper bankMapper;
    private final WalletMapper walletMapper;

    @Transactional
    public LinkBankResponse linkBank(Long userId, LinkBankRequest request) {
        User user = userService.getById(userId);

        if (bankAccountRepository.existsByBank_IdAndAccountNumber(request.getBankId(), request.getAccountNumber())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR,
                    "Tài khoản ngân hàng này đã được liên kết trên hệ thống.",
                    String.format("Số tài khoản %s thuộc Bank ID %d đã tồn tại.", request.getAccountNumber(), request.getBankId()));
        }

        Bank bankInfo = bankRepository.findById(request.getBankId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND,
                        "Ngân hàng không tồn tại trên hệ thống.",
                        "Không tìm thấy Master Bank với ID: " + request.getBankId()));

        if (!bankInfo.getActive()) {
            throw new BusinessException(ErrorCode.ACCOUNT_DISABLED,
                    "Hệ thống đang bảo trì liên kết với ngân hàng này.",
                    "Master Bank đang ở trạng thái Inactive ID: " + bankInfo.getId());
        }

        if (bankAccountRepository.existsByUserIdAndBank_Id(userId, bankInfo.getId())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR,
                    "Bạn đã liên kết tài khoản thuộc ngân hàng này rồi.",
                    String.format("User %d cố tình liên kết thêm tài khoản thuộc Bank ID %d", userId, bankInfo.getId()));
        }

        BankAccount bankAccount = BankAccount.builder()
                .userId(userId)
                .bank(bankInfo)
                .accountNumber(request.getAccountNumber())
                .accountHolder(user.getFullName())
                .phone(request.getPhone())
                .balance(BigDecimal.valueOf(100_000_000)) // Mock số dư ngân hàng
                .status(BankStatus.ACTIVE)
                .build();

        bankAccountRepository.save(bankAccount);

        return bankMapper.toLinkResponse(bankAccount);
    }

    @Transactional
    public void unlinkBank(Long userId, Long bankId) {
        BankAccount bank = bankAccountRepository.findByIdAndUserId(bankId, userId)
                .orElseThrow(() -> new BankAccountNotFoundException(bankId));

        if (bank.getStatus() == BankStatus.UNLINKED) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Tài khoản ngân hàng này đã hủy liên kết từ trước.");
        }

        bank.setStatus(BankStatus.UNLINKED);
    }

    @Transactional(readOnly = true)
    public void initiateDeposit(Long userId, DepositRequest request) {
        User user = userService.getById(userId);
        BankAccount bank = bankAccountRepository.findById(request.getBankId())
                .orElseThrow(() -> new BankAccountNotFoundException(request.getBankId()));

        if (!bank.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR,
                    "Tài khoản ngân hàng không hợp lệ.",
                    String.format("User %d cố gắng truy cập trái phép BankAccount của User %d", userId, bank.getUserId()));
        }
        if (bank.getStatus() != BankStatus.ACTIVE) {
            throw new BusinessException(ErrorCode.ACCOUNT_DISABLED, "Tài khoản ngân hàng liên kết hiện không khả dụng.");
        }

        // Xác thực mã PIN giao dịch
        userService.validatePin(user, request.getPin());

        // Kiểm tra số dư tài khoản ngân hàng liên kết
        if (bank.getBalance().compareTo(request.getAmount()) < 0) {
            throw new BusinessException(ErrorCode.INSUFFICIENT_BALANCE,
                    "Số dư tài khoản ngân hàng không đủ để nạp tiền.",
                    String.format("Tài khoản ngân hàng %s có số dư (%s) thấp hơn mức nạp (%s)", bank.getAccountNumber(), bank.getBalance(), request.getAmount()));
        }

        // Gửi OTP nạp tiền
        otpService.sendOtp(userId, OtpType.TOP_UP);
    }

    @Transactional
    public TopUpResponse confirmDeposit(Long userId, DepositRequest request, String otp) {
        // Xác thực OTP (Sai tự văng lỗi runtime chuẩn hóa từ OtpService)
        otpService.verifyOtp(userId, otp, OtpType.TOP_UP);

        BankAccount bank = bankAccountRepository.findByIdForUpdate(request.getBankId())
                .orElseThrow(() -> new BankAccountNotFoundException(request.getBankId()));

        // Kiểm tra lại số dư thực tế khi đã lock bản ghi phòng luồng song song bypass
        if (bank.getBalance().compareTo(request.getAmount()) < 0) {
            throw new BusinessException(ErrorCode.INSUFFICIENT_BALANCE, "Số dư tài khoản ngân hàng không đủ để nạp tiền.");
        }

        // Khấu trừ tài khoản ngân hàng & cộng vào ví điện tử
        bank.setBalance(bank.getBalance().subtract(request.getAmount()));
        Wallet wallet = walletService.increaseBalance(userId, request.getAmount());

        // Sinh hóa đơn transaction
        Transaction tx = transactionService.createTopUpTransaction(userId, bank, request.getAmount());
        transactionRepository.save(tx);

        return walletMapper.toTopUpResponse(tx, wallet);
    }

    @Transactional(readOnly = true)
    public void initiateWithdraw(Long userId, WithdrawRequest request) {
        User user = userService.getById(userId);
        BankAccount bank = bankAccountRepository.findById(request.getBankId())
                .orElseThrow(() -> new BankAccountNotFoundException(request.getBankId()));

        if (!bank.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Tài khoản ngân hàng không hợp lệ.");
        }
        if (bank.getStatus() != BankStatus.ACTIVE) {
            throw new BusinessException(ErrorCode.ACCOUNT_DISABLED, "Tài khoản ngân hàng liên kết hiện không khả dụng.");
        }

        // Xác thực PIN trước
        userService.validatePin(user, request.getPin());

        // Gửi mã OTP rút tiền
        otpService.sendOtp(userId, OtpType.WITHDRAW);
    }

    @Transactional
    public WithdrawResponse confirmWithdraw(Long userId, WithdrawRequest request, String otp) {
        // Xác thực OTP
        otpService.verifyOtp(userId, otp, OtpType.WITHDRAW);

        BankAccount bank = bankAccountRepository.findByIdForUpdate(request.getBankId())
                .orElseThrow(() -> new BankAccountNotFoundException(request.getBankId()));

        // Trừ tiền ví (Hàm decreaseBalance nội bộ tự lock và check số dư kèm ném InsufficientBalanceException động)
        Wallet wallet = walletService.decreaseBalance(userId, request.getAmount());

        // Cộng tiền ngược lại tài khoản ngân hàng liên kết
        bank.setBalance(bank.getBalance().add(request.getAmount()));

        Transaction tx = transactionService.createWithdrawTransaction(userId, bank, request.getAmount());
        transactionRepository.save(tx);

        return bankMapper.toWithdrawResponse(tx, wallet.getBalance(), bank.getBalance());
    }

    @Transactional(readOnly = true)
    public List<BankResponse> getMyBanks(Long userId) {
        return bankAccountRepository.findAllByUserId(userId)
                .stream()
                .filter(bank -> bank.getStatus() == BankStatus.ACTIVE)
                .map(bankMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<BankResponse> getHistory(Long userId) {
        return bankAccountRepository.findAllByUserId(userId)
                .stream()
                .map(bankMapper::toResponse)
                .toList();
    }

    public List<BankMasterResponse> getMasterBanks() {
        return bankRepository.findByActiveTrue()
                .stream()
                .map(bank -> BankMasterResponse.builder()
                        .id(bank.getId())
                        .code(bank.getCode())
                        .name(bank.getName())
                        .logo(bank.getLogo())
                        .build())
                .toList();
    }
}