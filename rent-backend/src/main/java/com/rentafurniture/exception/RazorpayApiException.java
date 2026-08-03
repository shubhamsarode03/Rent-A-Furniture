package com.rentafurniture.exception;

public class RazorpayApiException extends RuntimeException {
    public RazorpayApiException(String message) { super(message); }
    public RazorpayApiException(String message, Throwable cause) { super(message, cause); }
}
