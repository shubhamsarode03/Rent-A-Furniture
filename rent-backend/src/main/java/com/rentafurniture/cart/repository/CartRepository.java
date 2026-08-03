package com.rentafurniture.cart.repository;

import com.rentafurniture.cart.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {
    List<Cart> findByUserId(Long userId);
    Optional<Cart> findByUserIdAndFurnitureId(Long userId, Long furnitureId);
    void deleteByUserId(Long userId);
}
