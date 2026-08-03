package com.rentafurniture.order.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderRequest {

    @NotNull(message = "Rental start date is required")
    private LocalDate rentedOn;

    @NotNull(message = "Return date is required")
    private LocalDate returnDate;

    @NotNull(message = "Duration (in months) is required for each item")
    @Size(min = 1, message = "At least one item must be in the order")
    private List<OrderItemRequest> items;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemRequest {
        @NotNull(message = "Furniture ID is required")
        private Long furnitureId;

        @NotNull(message = "Duration is required")
        @Min(value = 1, message = "Minimum rental duration is 1 month")
        private Integer durationMonths;
    }
}
