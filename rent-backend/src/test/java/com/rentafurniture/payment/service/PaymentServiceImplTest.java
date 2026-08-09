package com.rentafurniture.payment.service;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.rentafurniture.exception.InvalidOrderStateException;
import com.rentafurniture.order.entity.Order;
import com.rentafurniture.order.entity.OrderStatus;
import com.rentafurniture.order.repository.OrderRepository;
import com.rentafurniture.payment.dto.PaymentCreateRequest;
import com.rentafurniture.payment.entity.PaymentStatus;
import com.rentafurniture.payment.mapper.PaymentMapper;
import com.rentafurniture.payment.repository.PaymentRepository;
import com.rentafurniture.payment.service.impl.PaymentServiceImpl;
import com.rentafurniture.user.entity.Role;
import com.rentafurniture.user.entity.User;
import com.rentafurniture.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceImplTest {

    @Mock PaymentRepository paymentRepository;
    @Mock OrderRepository orderRepository;
    @Mock UserRepository userRepository;
    @Mock RazorpayClient razorpayClient;
    @Mock PaymentMapper paymentMapper;
    @InjectMocks PaymentServiceImpl paymentService;

    private User buildUser(Long id, String email) {
        return User.builder().id(id).email(email).role(Role.RENTER).build();
    }

    private Order buildOrder(Long id, User user) {
        return Order.builder().id(id).user(user).status(OrderStatus.PENDING)
                .totalAmount(BigDecimal.valueOf(1000)).build();
    }

    @Test
    void createPayment_alreadySuccessful_throwsException() {
        User user = buildUser(1L, "renter@test.com");
        Order order = buildOrder(1L, user);
        PaymentCreateRequest request = new PaymentCreateRequest(1L, BigDecimal.valueOf(1000));

        when(userRepository.findByEmail("renter@test.com")).thenReturn(Optional.of(user));
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(paymentRepository.existsByOrderIdAndStatus(1L, PaymentStatus.SUCCESS)).thenReturn(true);

        assertThrows(InvalidOrderStateException.class,
                () -> paymentService.createPayment(request, "renter@test.com"));
    }

    @Test
    void getPaymentsByOrder_orderNotFound_throwsException() {
        when(orderRepository.existsById(99L)).thenReturn(false);
        assertThrows(com.rentafurniture.exception.OrderNotFoundException.class,
                () -> paymentService.getPaymentsByOrder(99L));
    }
}
