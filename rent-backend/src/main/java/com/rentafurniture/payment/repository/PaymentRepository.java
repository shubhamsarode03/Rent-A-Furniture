package com.rentafurniture.payment.repository;

import com.rentafurniture.payment.entity.Payment;
import com.rentafurniture.payment.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByOrderId(Long orderId);
    boolean existsByOrderIdAndStatus(Long orderId, PaymentStatus status);
    Optional<Payment> findByRazorpayOrderId(String razorpayOrderId);
    Optional<Payment> findByOrderIdAndStatus(Long orderId, PaymentStatus status);
}
