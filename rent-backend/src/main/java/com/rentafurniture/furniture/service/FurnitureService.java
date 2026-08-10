package com.rentafurniture.furniture.service;

import com.rentafurniture.furniture.dto.FurnitureRequest;
import com.rentafurniture.furniture.dto.FurnitureResponse;
import com.rentafurniture.furniture.entity.FurnitureStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;

public interface FurnitureService {
    FurnitureResponse createFurniture(FurnitureRequest request, String ownerEmail);
    FurnitureResponse getFurnitureById(Long id, String userEmail);
    FurnitureResponse getPublicFurnitureById(Long id);
    Page<FurnitureResponse> getPublicFurniture(Long categoryId, BigDecimal minPrice, BigDecimal maxPrice, String search, Pageable pageable);
    Page<FurnitureResponse> getAllFurnitureForOwner(String ownerEmail, FurnitureStatus status, String search, Pageable pageable);
    Page<FurnitureResponse> getAllFurnitureForAdmin(FurnitureStatus status, String search, Pageable pageable);
    FurnitureResponse updateFurniture(Long id, FurnitureRequest request, String ownerEmail);
    void deleteFurniture(Long id, String ownerEmail);
    FurnitureResponse approveFurniture(Long id);
    FurnitureResponse rejectFurniture(Long id);
    FurnitureResponse markAsRented(Long id);
    FurnitureResponse markAsAvailable(Long id);
}
