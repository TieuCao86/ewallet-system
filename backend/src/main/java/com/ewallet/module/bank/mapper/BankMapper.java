package com.ewallet.module.bank.mapper;

import com.ewallet.module.bank.dto.BankResponse;
import com.ewallet.module.bank.dto.LinkBankResponse;
import com.ewallet.module.bank.dto.WithdrawResponse;
import com.ewallet.module.bank.entity.BankAccount;
import com.ewallet.module.transaction.entity.Transaction;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.math.BigDecimal;

@Mapper(componentModel = "spring")
public interface BankMapper {

    // 1. Ánh xạ thông tin tài khoản ngân hàng thuần túy
    @Mapping(target = "bankId", source = "bank.id")
    @Mapping(target = "bankName", source = "bank.name")
    BankResponse toResponse(BankAccount bankAccount);

    // 2. Ánh xạ phản hồi khi liên kết ngân hàng thành công (Deep Mapping)
    @Mapping(target = "bankCode", source = "bank.code")
    @Mapping(target = "bankName", source = "bank.name")
    LinkBankResponse toLinkResponse(BankAccount bankAccount);

    // 3. Sử dụng Multiple Sources để gom dữ liệu từ luồng xử lý Rút tiền thành công
    // MapStruct tự động map transactionCode, amount từ 'transaction' và số dư từ các tham số trùng tên còn lại.
    WithdrawResponse toWithdrawResponse(
            Transaction transaction,
            BigDecimal walletBalance,
            BigDecimal bankBalance
    );
}