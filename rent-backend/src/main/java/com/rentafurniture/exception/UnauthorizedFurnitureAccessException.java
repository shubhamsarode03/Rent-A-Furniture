package com.rentafurniture.exception;

public class UnauthorizedFurnitureAccessException extends RuntimeException {
    public UnauthorizedFurnitureAccessException() {
        super("You are not authorized to modify this furniture listing");
    }
}
