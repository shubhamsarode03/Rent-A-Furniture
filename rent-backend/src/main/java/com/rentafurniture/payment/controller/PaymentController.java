package com.rentafurniture.payment.controller;

import com.rentafurniture.payment.dto.PaymentCreateRequest;
import com.rentafurniture.payment.dto.PaymentResponse;
import com.rentafurniture.payment.dto.PaymentVerifyRequest;
import com.rentafurniture.payment.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create")
    @PreAuthorize("hasAnyRole('RENTER', 'LENDER')")
    public ResponseEntity<PaymentResponse> createPayment(@Valid @RequestBody PaymentCreateRequest request,
                                                          @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(paymentService.createPayment(request, userDetails.getUsername()));
    }

    @PostMapping("/verify")
    @PreAuthorize("hasAnyRole('RENTER', 'LENDER')")
    public ResponseEntity<PaymentResponse> verifyPayment(@Valid @RequestBody PaymentVerifyRequest request,
                                                          @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(paymentService.verifyPayment(request, userDetails.getUsername()));
    }

    @GetMapping("/{orderId}")
    @PreAuthorize("hasAnyRole('RENTER', 'LENDER') or hasRole('ADMIN')")
    public ResponseEntity<List<PaymentResponse>> getPaymentsByOrder(@PathVariable Long orderId) {
        return ResponseEntity.ok(paymentService.getPaymentsByOrder(orderId));
    }
}
