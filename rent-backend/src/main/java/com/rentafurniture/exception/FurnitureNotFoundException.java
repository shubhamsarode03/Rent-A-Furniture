package com.rentafurniture.exception;

public class FurnitureNotFoundException extends RuntimeException {
    public FurnitureNotFoundException(Long id) { super("Furniture not found with id: " + id); }
}
