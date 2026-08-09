package com.rentafurniture.order.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rentafurniture.exception.GlobalExceptionHandler;
import com.rentafurniture.order.dto.OrderResponse;
import com.rentafurniture.order.entity.OrderStatus;
import com.rentafurniture.order.service.OrderService;
import com.rentafurniture.security.CustomUserDetailsService;
import com.rentafurniture.security.config.SecurityConfig;
import com.rentafurniture.security.jwt.JwtAuthFilter;
import com.rentafurniture.security.jwt.JwtUtil;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(OrderController.class)
@Import({GlobalExceptionHandler.class, SecurityConfig.class, JwtAuthFilter.class})
class OrderControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @MockBean OrderService orderService;
    @MockBean JwtUtil jwtUtil;
    @MockBean CustomUserDetailsService customUserDetailsService;

    @Test
    @WithMockUser(roles = "ADMIN")
    void getAllOrders_asAdmin_returns200() throws Exception {
        OrderResponse order = OrderResponse.builder()
                .id(1L).userId(1L).totalAmount(BigDecimal.valueOf(1000))
                .status(OrderStatus.PENDING).build();
        when(orderService.getAllOrders()).thenReturn(List.of(order));

        mockMvc.perform(get("/api/orders"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].status").value("PENDING"));
    }

    @Test
    @WithMockUser(roles = "RENTER")
    void getAllOrders_asRenter_returns403() throws Exception {
        mockMvc.perform(get("/api/orders"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "RENTER", username = "renter@test.com")
    void getMyOrders_asRenter_returns200() throws Exception {
        OrderResponse order = OrderResponse.builder()
                .id(1L).userId(1L).totalAmount(BigDecimal.valueOf(1000))
                .status(OrderStatus.PENDING).build();
        when(orderService.getOrdersForUser("renter@test.com")).thenReturn(List.of(order));

        mockMvc.perform(get("/api/orders/my"))
                .andExpect(status().isOk());
    }
}
