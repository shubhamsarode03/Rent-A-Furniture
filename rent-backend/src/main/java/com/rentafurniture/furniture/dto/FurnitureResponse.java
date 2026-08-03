package com.rentafurniture.furniture.dto;

import com.rentafurniture.furniture.entity.FurnitureStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FurnitureResponse {
    private Long id;
    private Long ownerId;
    private String ownerName;
    private Long categoryId;
    private String categoryName;
    private String fname;
    private String description;
    private BigDecimal pricePerMonth;
    private FurnitureStatus status;
    private LocalDateTime createdOn;
}
