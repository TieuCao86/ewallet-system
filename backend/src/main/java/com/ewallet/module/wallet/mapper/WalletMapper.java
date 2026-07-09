package com.ewallet.module.wallet.mapper;

import com.ewallet.module.transaction.entity.Transaction;
import com.ewallet.module.wallet.dto.TopUpResponse;
import com.ewallet.module.wallet.dto.WalletBalanceResponse;
import com.ewallet.module.wallet.entity.Wallet;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface WalletMapper {

    WalletBalanceResponse toBalanceResponse(Wallet wallet);

    // 2. Sử dụng cơ chế Multiple Sources để gom dữ liệu cho phản hồi Nạp tiền thành công
    // MapStruct tự động map:
    // - walletNumber từ 'wallet'
    // - newBalance từ 'wallet.balance' thông qua cấu hình Mapping rõ ràng
    // - transactionCode và amount từ 'transaction'
    @Mapping(target = "newBalance", source = "wallet.balance")
    TopUpResponse toTopUpResponse(Transaction transaction, Wallet wallet);
}