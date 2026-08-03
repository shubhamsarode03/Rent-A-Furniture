package com.rentafurniture.exception;

public class InvalidPaymentSignatureException extends RuntimeException {
    public InvalidPaymentSignatureException() { super("Payment signature verification failed"); }
}
