package com.rentafurniture.cart.service;

import com.rentafurniture.cart.dto.CartItemRequest;
import com.rentafurniture.cart.dto.CartResponse;

import java.util.List;

public interface CartService {
    CartResponse addToCart(CartItemRequest request, String userEmail);
    List<CartResponse> getCart(String userEmail);
    void removeFromCart(Long cartItemId, String userEmail);
    void clearCart(String userEmail);
}
