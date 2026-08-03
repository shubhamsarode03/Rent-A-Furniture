package com.rentafurniture.exception;

public class CartItemNotFoundException extends RuntimeException {
    public CartItemNotFoundException(Long id) { super("Cart item not found with id: " + id); }
    public CartItemNotFoundException(String message) { super(message); }
}
