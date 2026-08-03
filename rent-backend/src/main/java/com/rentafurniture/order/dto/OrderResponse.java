package com.rentafurniture.order.dto;

import com.rentafurniture.order.entity.OrderStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private Long id;
    private Long userId;
    private String userEmail;
    private BigDecimal totalAmount;
    private OrderStatus status;
    private LocalDate rentedOn;
    private LocalDate returnDate;
    private LocalDateTime createdOn;
    private List<OrderDetailsResponse> items;
}
