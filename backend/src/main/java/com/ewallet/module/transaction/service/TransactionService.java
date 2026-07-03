package com.ewallet.module.transaction.service;

import com.ewallet.common.exception.InsufficientBalanceException;
import com.ewallet.common.exception.InvalidPinException;
import com.ewallet.common.exception.NotFoundException;
import com.ewallet.module.bank.entity.BankAccount;
import com.ewallet.module.kyc.service.KycService;
import com.ewallet.module.transaction.dto.TransactionResponse;
import com.ewallet.module.transaction.dto.TransferRequest;
import com.ewallet.module.transaction.dto.TransferResponse;
import com.ewallet.module.transaction.entity.Transaction;
import com.ewallet.module.transaction.enums.TransactionDirection;
import com.ewallet.module.transaction.enums.TransactionStatus;
import com.ewallet.module.transaction.enums.TransactionType;
import com.ewallet.module.transaction.repository.TransactionRepository;
import com.ewallet.module.transaction.util.TransactionCodeGenerator;
import com.ewallet.module.user.entity.User;
import com.ewallet.module.user.repository.UserRepository;
import com.ewallet.module.wallet.entity.Wallet;
import com.ewallet.module.wallet.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final WalletRepository walletRepository;
    private final UserRepository userRepository;

    private final KycService kycService;
    private final PasswordEncoder passwordEncoder;
    private final TransactionCodeGenerator transactionCodeGenerator;

    public Transaction createTopUpTransaction(Long userId, BankAccount bankAccount, BigDecimal amount) {
        return createBankTransaction(getUser(userId), bankAccount, amount, TransactionType.TOP_UP, "Top up from bank");
    }

    public Transaction createWithdrawTransaction(Long userId, BankAccount bankAccount, BigDecimal amount) {
        return createBankTransaction(getUser(userId), bankAccount, amount, TransactionType.WITHDRAW, "Withdraw to bank");
    }

    private Transaction createTransferTransaction(User sender, User receiver, BigDecimal amount, String description) {
        Transaction transaction = Transaction.builder()
                .transactionCode(transactionCodeGenerator.generate())
                .senderUserId(sender.getId())
                .receiverUserId(receiver.getId())
                .senderName(sender.getFullName())
                .receiverName(receiver.getFullName())
                .senderPhone(sender.getPhone())
                .receiverPhone(receiver.getPhone())
                .amount(amount)
                .fee(BigDecimal.ZERO)
                .type(TransactionType.TRANSFER)
                .status(TransactionStatus.SUCCESS)
                .description(description)
                .build();

        return transactionRepository.save(transaction);
    }

    @Transactional(readOnly = true)
    public List<TransactionResponse> getHistory(Long userId) {
        List<Transaction> transactions = transactionRepository
                .findBySenderUserIdOrReceiverUserIdOrderByCreatedAtDesc(userId, userId);

        return transactions.stream()
                .map(tx -> {
                    TransactionDirection direction;
                    String otherPartyName;

                    switch (tx.getType()) {
                        case TRANSFER -> {
                            if (userId.equals(tx.getSenderUserId())) {
                                direction = TransactionDirection.OUT;
                                otherPartyName = tx.getReceiverName();
                            } else {
                                direction = TransactionDirection.IN;
                                otherPartyName = tx.getSenderName();
                            }
                        }
                        case TOP_UP -> {
                            direction = TransactionDirection.IN;
                            otherPartyName = "Nạp tiền vào ví";
                        }
                        case WITHDRAW -> {
                            direction = TransactionDirection.OUT;
                            otherPartyName = "Rút tiền về ngân hàng";
                        }
                        default -> {
                            direction = TransactionDirection.SYSTEM;
                            otherPartyName = "Hệ thống ví";
                        }
                    }

                    return TransactionResponse.builder()
                            .transactionCode(tx.getTransactionCode())
                            .amount(tx.getAmount())
                            .fee(tx.getFee())
                            .type(tx.getType())
                            .status(tx.getStatus())
                            .otherPartyName(otherPartyName)
                            .direction(direction)
                            .description(tx.getDescription())
                            .createdAt(tx.getCreatedAt())
                            .build();
                })
                .toList();
    }

    @Transactional
    public TransferResponse transfer(User sender, TransferRequest request) {
        kycService.validateKycApproval(sender.getId());
        validatePin(sender, request.getPin());

        User receiver = userRepository.findByPhone(request.getReceiverPhone())
                .orElseThrow(() -> new NotFoundException("Người nhận không tồn tại trên hệ thống."));

        if (sender.getId().equals(receiver.getId())) {
            throw new IllegalArgumentException("Không thể chuyển tiền cho chính bản thân.");
        }

        Wallet senderWallet;
        Wallet receiverWallet;
        if (sender.getId() < receiver.getId()) {
            senderWallet = getWalletForUpdate(sender.getId());
            receiverWallet = getWalletForUpdate(receiver.getId());
        } else {
            receiverWallet = getWalletForUpdate(receiver.getId());
            senderWallet = getWalletForUpdate(sender.getId());
        }

        if (senderWallet.getBalance().compareTo(request.getAmount()) < 0) {
            throw new InsufficientBalanceException("Số dư khả dụng trong ví không đủ.");
        }

        senderWallet.setBalance(senderWallet.getBalance().subtract(request.getAmount()));
        receiverWallet.setBalance(receiverWallet.getBalance().add(request.getAmount()));

        walletRepository.save(senderWallet);
        walletRepository.save(receiverWallet);

        Transaction savedTransaction = createTransferTransaction(
                sender,
                receiver,
                request.getAmount(),
                request.getDescription()
        );

        return TransferResponse.builder()
                .transactionCode(savedTransaction.getTransactionCode())
                .amount(savedTransaction.getAmount())
                .balance(senderWallet.getBalance())
                .status(savedTransaction.getStatus())
                .createdAt(savedTransaction.getCreatedAt())
                .build();
    }

    private Transaction createBankTransaction(
            User user,
            BankAccount bankAccount,
            BigDecimal amount,
            TransactionType type,
            String description
    ) {

        Transaction transaction = Transaction.builder()
                .transactionCode(transactionCodeGenerator.generate())
                .senderUserId(user.getId())
                .senderName(user.getFullName())
                .senderPhone(user.getPhone())

                .bankId(bankAccount.getBank().getId())
                .bankAccountId(bankAccount.getId())
                .bankNameSnapshot(bankAccount.getBank().getName())
                .bankAccountNumberSnapshot(bankAccount.getAccountNumber())

                .amount(amount)
                .fee(BigDecimal.ZERO)
                .type(type)
                .status(TransactionStatus.SUCCESS)
                .description(description)
                .build();

        return transactionRepository.save(transaction);
    }

    private Wallet getWalletForUpdate(Long userId) {
        return walletRepository.findByUserIdForUpdate(userId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy ví của người dùng: " + userId));
    }

    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Người dùng không tồn tại."));
    }

    private void validatePin(User user, String rawPin) {
        if (user.getPin() == null) {
            throw new InvalidPinException("Vui lòng tạo mã PIN giao dịch trước khi thực hiện.");
        }
        if (!passwordEncoder.matches(rawPin, user.getPin())) {
            throw new InvalidPinException("Mã PIN giao dịch không chính xác.");
        }
    }
}