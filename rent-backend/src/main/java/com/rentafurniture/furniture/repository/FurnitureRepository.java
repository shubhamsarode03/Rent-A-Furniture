package com.rentafurniture.furniture.repository;

import com.rentafurniture.furniture.entity.Furniture;
import com.rentafurniture.furniture.entity.FurnitureStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface FurnitureRepository extends JpaRepository<Furniture, Long> {

    List<Furniture> findByOwnerId(Long ownerId);

    @Query("SELECT f FROM Furniture f WHERE " +
            "f.status = :status AND " +
            "(:categoryId IS NULL OR f.category.id = :categoryId) AND " +
            "(:minPrice IS NULL OR f.pricePerMonth >= :minPrice) AND " +
            "(:maxPrice IS NULL OR f.pricePerMonth <= :maxPrice) AND " +
            "(:search IS NULL OR LOWER(f.fname) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(f.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Furniture> findPublicFurniture(
            @Param("status") FurnitureStatus status,
            @Param("categoryId") Long categoryId,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("search") String search,
            Pageable pageable);

    @Query("SELECT f FROM Furniture f WHERE " +
            "(:categoryId IS NULL OR f.category.id = :categoryId) AND " +
            "(:minPrice IS NULL OR f.pricePerMonth >= :minPrice) AND " +
            "(:maxPrice IS NULL OR f.pricePerMonth <= :maxPrice) AND " +
            "(:status IS NULL OR f.status = :status) AND " +
            "(:search IS NULL OR LOWER(f.fname) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(f.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Furniture> findWithFilters(
            @Param("categoryId") Long categoryId,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("status") FurnitureStatus status,
            @Param("search") String search,
            Pageable pageable);

    @Query("SELECT f FROM Furniture f WHERE f.owner.id = :ownerId AND " +
            "(:status IS NULL OR f.status = :status) AND " +
            "(:search IS NULL OR LOWER(f.fname) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(f.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Furniture> findByOwnerIdWithFilters(
            @Param("ownerId") Long ownerId,
            @Param("status") FurnitureStatus status,
            @Param("search") String search,
            Pageable pageable);

    List<Furniture> findByStatus(FurnitureStatus status);
}