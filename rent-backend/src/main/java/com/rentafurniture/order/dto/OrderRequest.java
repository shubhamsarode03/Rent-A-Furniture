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

    @NotNull(message = "Delivery address ID is required")
    private Long addressId;

    // Address snapshot fields
    private String deliveryFullName;
    private String deliveryPhone;
    private String deliveryAddressLine1;
    private String deliveryAddressLine2;
    private String deliveryCity;
    private String deliveryState;
    private String deliveryPostalCode;
    private String deliveryCountry;

    @NotNull(message = "Rental start date is required")
    @FutureOrPresent(message = "Rental start date cannot be in the past")
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
        @Max(value = 12, message = "Maximum rental duration is 12 months")
        private Integer durationMonths;
    }
}
