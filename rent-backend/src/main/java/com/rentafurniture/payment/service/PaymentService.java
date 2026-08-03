package com.rentafurniture.payment.service;

import com.rentafurniture.payment.dto.PaymentCreateRequest;
import com.rentafurniture.payment.dto.PaymentResponse;
import com.rentafurniture.payment.dto.PaymentVerifyRequest;

import java.util.List;

public interface PaymentService {
    PaymentResponse createPayment(PaymentCreateRequest request, String userEmail);
    PaymentResponse verifyPayment(PaymentVerifyRequest request, String userEmail);
    List<PaymentResponse> getPaymentsByOrder(Long orderId);
}
