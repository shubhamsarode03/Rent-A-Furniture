package com.rentafurniture.order.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderDetailsResponse {
    private Long id;
    private Long furnitureId;
    private String furnitureName;
    private BigDecimal pricePerMonth;
    private Integer duration;
    private BigDecimal lineTotal;
}
