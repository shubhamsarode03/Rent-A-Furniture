package com.rentafurniture.payment.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rentafurniture.exception.GlobalExceptionHandler;
import com.rentafurniture.payment.dto.PaymentCreateRequest;
import com.rentafurniture.payment.dto.PaymentResponse;
import com.rentafurniture.payment.entity.PaymentStatus;
import com.rentafurniture.payment.service.PaymentService;
import com.rentafurniture.security.CustomUserDetailsService;
import com.rentafurniture.security.config.SecurityConfig;
import com.rentafurniture.security.jwt.JwtAuthFilter;
import com.rentafurniture.security.jwt.JwtUtil;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PaymentController.class)
@Import({GlobalExceptionHandler.class, SecurityConfig.class, JwtAuthFilter.class})
class PaymentControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @MockBean PaymentService paymentService;
    @MockBean JwtUtil jwtUtil;
    @MockBean CustomUserDetailsService customUserDetailsService;

    @Test
    @WithMockUser(roles = "RENTER", username = "renter@test.com")
    void createPayment_validRequest_returns201() throws Exception {
        PaymentCreateRequest request = new PaymentCreateRequest(1L, BigDecimal.valueOf(1000));
        PaymentResponse response = PaymentResponse.builder()
                .id(1L).orderId(1L).amount(BigDecimal.valueOf(1000))
                .status(PaymentStatus.CREATED)
                .razorpayOrderId("order_test123")
                .razorpayKeyId("rzp_test_key")
                .currency("INR")
                .build();

        when(paymentService.createPayment(any(), any())).thenReturn(response);

        mockMvc.perform(post("/api/payments/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.razorpayOrderId").value("order_test123"))
                .andExpect(jsonPath("$.status").value("CREATED"));
    }

    @Test
    @WithMockUser(roles = "LENDER")
    void createPayment_asLender_returns403() throws Exception {
        PaymentCreateRequest request = new PaymentCreateRequest(1L, BigDecimal.valueOf(1000));

        mockMvc.perform(post("/api/payments/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }
}
