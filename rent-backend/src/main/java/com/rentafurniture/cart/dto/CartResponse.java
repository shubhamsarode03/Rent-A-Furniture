package com.rentafurniture.cart.dto;

import com.rentafurniture.furniture.entity.FurnitureStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartResponse {
    private Long id;
    private Long furnitureId;
    private String furnitureName;
    private BigDecimal pricePerMonth;
    private FurnitureStatus status;
    private String imageUrl;
    private String categoryName;
    private LocalDateTime addedAt;
}
