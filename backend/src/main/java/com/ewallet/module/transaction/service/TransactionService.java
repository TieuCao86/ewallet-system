package com.ewallet.module.transaction.service;

import com.ewallet.common.exception.InsufficientBalanceException;
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
import com.ewallet.module.transaction.mapper.TransactionMapper;
import com.ewallet.module.transaction.repository.TransactionRepository;
import com.ewallet.module.transaction.util.TransactionCodeGenerator;
import com.ewallet.module.user.entity.User;
import com.ewallet.module.user.repository.UserRepository;
import com.ewallet.module.user.service.UserService;
import com.ewallet.module.wallet.entity.Wallet;
import com.ewallet.module.wallet.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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

    private final UserService userService;
    private final KycService kycService;
    private final TransactionCodeGenerator transactionCodeGenerator;
    private final TransactionMapper transactionMapper;

    @Transactional
    public TransferResponse transfer(Long senderId, TransferRequest request) {
        // Gọi qua UserService dùng chung
        User sender = userService.getById(senderId);

        kycService.validateKycApproval(sender.getId());
        userService.validatePin(sender, request.getPin());

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

        return transactionMapper.toTransferResponse(
                savedTransaction,
                senderWallet.getBalance()
        );
    }

    @Transactional(readOnly = true)
    public List<TransactionResponse> getHistory(Long userId) {
        List<Transaction> transactions = transactionRepository
                .findBySenderUserIdOrReceiverUserIdOrderByCreatedAtDesc(userId, userId);

        return transactions.stream()
                .map(tx -> toResponse(tx, userId))
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<TransactionResponse> getTransactions(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        return transactionRepository
                .findBySenderUserIdOrReceiverUserId(userId, userId, pageable)
                .map(tx -> toResponse(tx, userId));
    }

    public Transaction createTopUpTransaction(Long userId, BankAccount bankAccount, BigDecimal amount) {
        User user = userService.getById(userId);

        return Transaction.builder()
                .transactionCode(transactionCodeGenerator.generate())
                .receiverUserId(user.getId())
                .receiverName(user.getFullName())
                .receiverPhone(user.getPhone())
                .bankId(bankAccount.getBank().getId())
                .bankAccountId(bankAccount.getId())
                .bankNameSnapshot(bankAccount.getBank().getName())
                .bankAccountNumberSnapshot(bankAccount.getAccountNumber())
                .amount(amount)
                .fee(BigDecimal.ZERO)
                .type(TransactionType.TOP_UP)
                .status(TransactionStatus.SUCCESS)
                .description("Nạp tiền từ ngân hàng " + bankAccount.getBank().getName())
                .build();
    }

    public Transaction createWithdrawTransaction(Long userId, BankAccount bankAccount, BigDecimal amount) {
        User user = userService.getById(userId);

        return Transaction.builder()
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
                .type(TransactionType.WITHDRAW)
                .status(TransactionStatus.SUCCESS)
                .description("Rút tiền về ngân hàng " + bankAccount.getBank().getName())
                .build();
    }

    // 3. PRIVATE HELPER METHODS (Hàm bổ trợ logic nội bộ)

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

    private TransactionResponse toResponse(Transaction tx, Long userId) {
        TransactionResponse response = transactionMapper.toResponse(tx);

        switch (tx.getType()) {
            case TRANSFER -> {
                if (userId.equals(tx.getSenderUserId())) {
                    response.setDirection(TransactionDirection.OUT);
                    response.setOtherPartyName(tx.getReceiverName());
                } else {
                    response.setDirection(TransactionDirection.IN);
                    response.setOtherPartyName(tx.getSenderName());
                }
            }
            case TOP_UP -> {
                response.setDirection(TransactionDirection.IN);
                response.setOtherPartyName(tx.getBankNameSnapshot());
            }
            case WITHDRAW -> {
                response.setDirection(TransactionDirection.OUT);
                response.setOtherPartyName(tx.getBankNameSnapshot());
            }
            default -> {
                response.setDirection(TransactionDirection.SYSTEM);
                response.setOtherPartyName("Hệ thống ví");
            }
        }

        return response;
    }

    private Wallet getWalletForUpdate(Long userId) {
        return walletRepository.findByUserIdForUpdate(userId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy ví của người dùng: " + userId));
    }
}