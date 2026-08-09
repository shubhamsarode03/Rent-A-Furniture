package com.rentafurniture.order.service;

import com.rentafurniture.order.dto.OrderRequest;
import com.rentafurniture.order.dto.OrderResponse;
import com.rentafurniture.order.entity.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;

public interface OrderService {
    OrderResponse createOrder(OrderRequest request, String userEmail);
    void clearCartAfterSuccessfulPayment(String userEmail);
    OrderResponse getOrderById(Long id, String userEmail);
    Page<OrderResponse> getOrdersForUser(String userEmail, Pageable pageable);
    Page<OrderResponse> getAllOrders(OrderStatus status, LocalDate startDate, LocalDate endDate, Pageable pageable);
    OrderResponse updateOrderStatus(Long id, OrderStatus status);
    OrderResponse completeRental(Long id);
    OrderResponse retryPayment(Long id, String userEmail);
    OrderResponse cancelOrder(Long id, String userEmail, String reason);
    OrderResponse activateOrder(Long id, String deliveryNotes);
}
