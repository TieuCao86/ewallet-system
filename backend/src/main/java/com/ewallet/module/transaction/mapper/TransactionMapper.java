package com.ewallet.module.transaction.mapper;

import com.ewallet.module.transaction.dto.TransactionResponse;
import com.ewallet.module.transaction.dto.TransferResponse;
import com.ewallet.module.transaction.entity.Transaction;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.math.BigDecimal;

@Mapper(componentModel = "spring")
public interface TransactionMapper {

    @Mapping(target = "direction", ignore = true)
    @Mapping(target = "otherPartyName", ignore = true)
    TransactionResponse toResponse(Transaction transaction);

    TransferResponse toTransferResponse(Transaction transaction, BigDecimal balance);

}