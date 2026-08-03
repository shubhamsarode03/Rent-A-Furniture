package com.rentafurniture.exception;

public class CannotRentOwnFurnitureException extends RuntimeException {
    public CannotRentOwnFurnitureException(String message) {
        super(message);
    }
}
