package com.rentafurniture.payment.mapper;

import com.rentafurniture.payment.dto.PaymentResponse;
import com.rentafurniture.payment.entity.Payment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PaymentMapper {

    @Mapping(source = "order.id", target = "orderId")
    @Mapping(source = "user.id", target = "userId")
    PaymentResponse toResponse(Payment payment);
}
