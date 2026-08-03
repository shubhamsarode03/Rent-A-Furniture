package com.rentafurniture.payment.dto;

import com.rentafurniture.payment.entity.PaymentStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    private Long id;
    private Long orderId;
    private Long userId;
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String transactionId;
    private BigDecimal amount;
    private String method;
    private PaymentStatus status;
    private LocalDateTime createdOn;

    // Included only in create response
    private String razorpayKeyId;
    private String currency;
}
