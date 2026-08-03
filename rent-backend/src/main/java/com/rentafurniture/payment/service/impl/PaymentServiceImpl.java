package com.rentafurniture.payment.service.impl;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.rentafurniture.exception.*;
import com.rentafurniture.furniture.entity.Furniture;
import com.rentafurniture.furniture.entity.FurnitureStatus;
import com.rentafurniture.furniture.repository.FurnitureRepository;
import com.rentafurniture.order.entity.Order;
import com.rentafurniture.order.entity.OrderDetails;
import com.rentafurniture.order.entity.OrderStatus;
import com.rentafurniture.order.repository.OrderRepository;
import com.rentafurniture.payment.dto.PaymentCreateRequest;
import com.rentafurniture.payment.dto.PaymentResponse;
import com.rentafurniture.payment.dto.PaymentVerifyRequest;
import com.rentafurniture.payment.entity.Payment;
import com.rentafurniture.payment.entity.PaymentStatus;
import com.rentafurniture.payment.mapper.PaymentMapper;
import com.rentafurniture.payment.repository.PaymentRepository;
import com.rentafurniture.payment.service.PaymentService;
import com.rentafurniture.user.entity.User;
import com.rentafurniture.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.util.HexFormat;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final FurnitureRepository furnitureRepository;
    private final RazorpayClient razorpayClient;
    private final PaymentMapper paymentMapper;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    @Override
    @Transactional
    public PaymentResponse createPayment(PaymentCreateRequest request, String userEmail) {
        User user = findUserByEmail(userEmail);
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new OrderNotFoundException(request.getOrderId()));

        if (paymentRepository.existsByOrderIdAndStatus(order.getId(), PaymentStatus.SUCCESS)) {
            throw new InvalidOrderStateException("Order already has a successful payment");
        }

        try {
            JSONObject options = new JSONObject();
            // Razorpay expects amount in paise (multiply by 100)
            long amountInPaise = request.getAmount().multiply(BigDecimal.valueOf(100)).longValue();
            options.put("amount", amountInPaise);
            options.put("currency", "INR");
            options.put("receipt", "order_" + order.getId());

            com.razorpay.Order razorpayOrder = razorpayClient.orders.create(options);
            String rzpOrderId = razorpayOrder.get("id");

            Payment payment = Payment.builder()
                    .order(order)
                    .user(user)
                    .razorpayOrderId(rzpOrderId)
                    .amount(request.getAmount())
                    .status(PaymentStatus.CREATED)
                    .build();
            Payment saved = paymentRepository.save(payment);

            PaymentResponse response = paymentMapper.toResponse(saved);
            response.setRazorpayKeyId(razorpayKeyId);
            response.setCurrency("INR");
            return response;

        } catch (RazorpayException e) {
            throw new RazorpayApiException("Failed to create Razorpay order: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public PaymentResponse verifyPayment(PaymentVerifyRequest request, String userEmail) {
        Payment payment = paymentRepository.findByRazorpayOrderId(request.getRazorpayOrderId())
                .orElseThrow(() -> new PaymentNotFoundException("Payment not found for Razorpay order: "
                        + request.getRazorpayOrderId()));

        boolean valid = verifySignature(request.getRazorpayOrderId(),
                request.getRazorpayPaymentId(), request.getRazorpaySignature());

        if (!valid) {
            payment.setStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);
            throw new InvalidPaymentSignatureException();
        }

        payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
        payment.setTransactionId(request.getRazorpayPaymentId());
        payment.setStatus(PaymentStatus.SUCCESS);

        Order order = payment.getOrder();
        order.setStatus(OrderStatus.CONFIRMED);
        orderRepository.save(order);

        // Mark all furniture in the order as RENTED
        for (OrderDetails orderDetails : order.getOrderDetails()) {
            Furniture furniture = orderDetails.getFurniture();
            if (furniture.getStatus() == FurnitureStatus.AVAILABLE) {
                furniture.setStatus(FurnitureStatus.RENTED);
                furnitureRepository.save(furniture);
            }
        }

        return paymentMapper.toResponse(paymentRepository.save(payment));
    }

    @Override
    public List<PaymentResponse> getPaymentsByOrder(Long orderId) {
        if (!orderRepository.existsById(orderId)) throw new OrderNotFoundException(orderId);
        return paymentRepository.findByOrderId(orderId).stream()
                .map(paymentMapper::toResponse)
                .collect(Collectors.toList());
    }

    private boolean verifySignature(String razorpayOrderId, String razorpayPaymentId, String signature) {
        try {
            String payload = razorpayOrderId + "|" + razorpayPaymentId;
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(razorpayKeySecret.getBytes(), "HmacSHA256");
            mac.init(secretKey);
            byte[] hash = mac.doFinal(payload.getBytes());
            String computed = HexFormat.of().formatHex(hash);
            return computed.equals(signature);
        } catch (Exception e) {
            return false;
        }
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email).orElseThrow(() -> new UserNotFoundException(email));
    }
}
