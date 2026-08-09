package com.rentafurniture.order.service;

import org.springframework.http.ResponseEntity;

public interface InvoiceService {
    ResponseEntity<byte[]> generateInvoice(Long orderId, String userEmail);
}
