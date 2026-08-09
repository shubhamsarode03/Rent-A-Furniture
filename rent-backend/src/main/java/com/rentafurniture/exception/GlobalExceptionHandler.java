package com.rentafurniture.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private ErrorResponse buildError(HttpStatus status, String message, String path, List<String> errors) {
        return ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(status.value())
                .message(message)
                .path(path)
                .errors(errors)
                .build();
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex,
                                                          HttpServletRequest request) {
        List<String> errors = ex.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.toList());
        return ResponseEntity.badRequest()
                .body(buildError(HttpStatus.BAD_REQUEST, "Validation failed", request.getRequestURI(), errors));
    }

    @ExceptionHandler({UserNotFoundException.class, FurnitureNotFoundException.class,
            CartItemNotFoundException.class, OrderNotFoundException.class, PaymentNotFoundException.class,
            AddressNotFoundException.class})
    public ResponseEntity<ErrorResponse> handleNotFound(RuntimeException ex, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(buildError(HttpStatus.NOT_FOUND, ex.getMessage(), request.getRequestURI(), null));
    }

    @ExceptionHandler({DuplicateEmailException.class, InvalidOrderStateException.class})
    public ResponseEntity<ErrorResponse> handleConflict(RuntimeException ex, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(buildError(HttpStatus.CONFLICT, ex.getMessage(), request.getRequestURI(), null));
    }

    @ExceptionHandler({InvalidCredentialsException.class, InvalidPaymentSignatureException.class})
    public ResponseEntity<ErrorResponse> handleUnauthorized(RuntimeException ex, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(buildError(HttpStatus.UNAUTHORIZED, ex.getMessage(), request.getRequestURI(), null));
    }

    @ExceptionHandler(UnauthorizedFurnitureAccessException.class)
    public ResponseEntity<ErrorResponse> handleForbidden(UnauthorizedFurnitureAccessException ex,
                                                         HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(buildError(HttpStatus.FORBIDDEN, ex.getMessage(), request.getRequestURI(), null));
    }

    @ExceptionHandler(RazorpayApiException.class)
    public ResponseEntity<ErrorResponse> handleRazorpay(RazorpayApiException ex, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                .body(buildError(HttpStatus.BAD_GATEWAY, ex.getMessage(), request.getRequestURI(), null));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(buildError(HttpStatus.FORBIDDEN, "Access denied", request.getRequestURI(), null));
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthentication(AuthenticationException ex, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(buildError(HttpStatus.UNAUTHORIZED, ex.getMessage(), request.getRequestURI(), null));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(Exception ex, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(buildError(HttpStatus.INTERNAL_SERVER_ERROR,
                        "An unexpected error occurred", request.getRequestURI(), null));
    }
}

