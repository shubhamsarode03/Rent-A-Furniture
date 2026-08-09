package com.rentafurniture.order.service.impl;

import com.rentafurniture.exception.OrderNotFoundException;
import com.rentafurniture.exception.UserNotFoundException;
import com.rentafurniture.order.entity.Order;
import com.rentafurniture.order.entity.OrderStatus;
import com.rentafurniture.order.repository.OrderRepository;
import com.rentafurniture.order.service.InvoiceService;
import com.rentafurniture.payment.entity.Payment;
import com.rentafurniture.payment.entity.PaymentStatus;
import com.rentafurniture.payment.repository.PaymentRepository;
import com.rentafurniture.user.entity.Role;
import com.rentafurniture.user.entity.User;
import com.rentafurniture.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class InvoiceServiceImpl implements InvoiceService {

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;

    @Override
    public ResponseEntity<byte[]> generateInvoice(Long orderId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException(userEmail));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException(orderId));

        // Check authorization: user must own the order or be admin
        if (user.getRole() != Role.ADMIN && !order.getUser().getId().equals(user.getId())) {
            throw new OrderNotFoundException(orderId);
        }

        // Verify order is confirmed and payment is successful
        if (order.getStatus() != OrderStatus.CONFIRMED) {
            throw new RuntimeException("Invoice can only be generated for confirmed orders");
        }

        Payment payment = paymentRepository.findByOrderIdAndStatus(orderId, PaymentStatus.SUCCESS)
                .orElseThrow(() -> new RuntimeException("No successful payment found for this order"));

        try {
            byte[] pdfBytes = generatePdfInvoice(order, payment);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "invoice_" + order.getId() + ".pdf");

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate PDF invoice", e);
        }
    }

    private byte[] generatePdfInvoice(Order order, Payment payment) throws IOException {
        try (PDDocument document = new PDDocument();
             ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

            PDPage page = new PDPage();
            document.addPage(page);

            try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
                contentStream.setFont(PDType1Font.HELVETICA_BOLD, 16);
                contentStream.beginText();
                contentStream.newLineAtOffset(50, 750);
                contentStream.showText("RENT-A-FURNITURE - INVOICE");
                contentStream.endText();

                contentStream.setFont(PDType1Font.HELVETICA, 12);
                contentStream.beginText();
                contentStream.newLineAtOffset(50, 730);
                contentStream.showText("Invoice Number: INV-" + order.getId());
                contentStream.newLineAtOffset(0, -20);
                contentStream.showText("Order ID: #" + order.getId());
                contentStream.newLineAtOffset(0, -20);
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm");
                contentStream.showText("Date: " + order.getCreatedOn().format(formatter));
                contentStream.endText();

                contentStream.setFont(PDType1Font.HELVETICA_BOLD, 12);
                contentStream.beginText();
                contentStream.newLineAtOffset(50, 680);
                contentStream.showText("CUSTOMER DETAILS");
                contentStream.endText();

                contentStream.setFont(PDType1Font.HELVETICA, 12);
                contentStream.beginText();
                contentStream.newLineAtOffset(50, 660);
                contentStream.showText("Name: " + order.getDeliveryFullName());
                contentStream.newLineAtOffset(0, -20);
                contentStream.showText("Email: " + order.getUser().getEmail());
                contentStream.newLineAtOffset(0, -20);
                contentStream.showText("Phone: " + order.getDeliveryPhone());
                contentStream.endText();

                contentStream.setFont(PDType1Font.HELVETICA_BOLD, 12);
                contentStream.beginText();
                contentStream.newLineAtOffset(50, 600);
                contentStream.showText("DELIVERY ADDRESS");
                contentStream.endText();

                contentStream.setFont(PDType1Font.HELVETICA, 12);
                contentStream.beginText();
                contentStream.newLineAtOffset(50, 580);
                contentStream.showText(order.getDeliveryAddressLine1());
                contentStream.newLineAtOffset(0, -20);
                if (order.getDeliveryAddressLine2() != null) {
                    contentStream.showText(order.getDeliveryAddressLine2());
                    contentStream.newLineAtOffset(0, -20);
                }
                contentStream.showText(order.getDeliveryCity() + ", " + order.getDeliveryState());
                contentStream.newLineAtOffset(0, -20);
                contentStream.showText(order.getDeliveryPostalCode());
                contentStream.newLineAtOffset(0, -20);
                contentStream.showText(order.getDeliveryCountry());
                contentStream.endText();

                contentStream.setFont(PDType1Font.HELVETICA_BOLD, 12);
                contentStream.beginText();
                contentStream.newLineAtOffset(50, 480);
                contentStream.showText("ORDER DETAILS");
                contentStream.endText();

                float yPosition = 460;
                contentStream.setFont(PDType1Font.HELVETICA, 12);
                for (var od : order.getOrderDetails()) {
                    contentStream.beginText();
                    contentStream.newLineAtOffset(50, yPosition);
                    contentStream.showText(od.getFurniture().getFname());
                    contentStream.newLineAtOffset(0, -20);
                    contentStream.showText("  Monthly Rent: ₹" + od.getPricePerMonth());
                    contentStream.newLineAtOffset(0, -20);
                    contentStream.showText("  Duration: " + od.getDuration() + " month(s)");
                    contentStream.newLineAtOffset(0, -20);
                    contentStream.showText("  Subtotal: ₹" + od.getPricePerMonth().multiply(BigDecimal.valueOf(od.getDuration())));
                    contentStream.endText();
                    yPosition -= 90;
                }

                contentStream.setFont(PDType1Font.HELVETICA_BOLD, 12);
                contentStream.beginText();
                contentStream.newLineAtOffset(50, yPosition - 20);
                contentStream.showText("Furniture/Rental Amount: ₹" + order.getTotalAmount());
                contentStream.newLineAtOffset(0, -20);
                contentStream.showText("Delivery Fee: FREE");
                contentStream.newLineAtOffset(0, -20);
                contentStream.showText("TOTAL AMOUNT: ₹" + order.getTotalAmount());
                contentStream.endText();

                contentStream.setFont(PDType1Font.HELVETICA, 10);
                contentStream.beginText();
                contentStream.newLineAtOffset(50, yPosition - 80);
                contentStream.showText("PAYMENT STATUS: " + payment.getStatus());
                contentStream.newLineAtOffset(0, -15);
                contentStream.showText("Razorpay Payment ID: " + payment.getRazorpayPaymentId());
                contentStream.newLineAtOffset(0, -15);
                contentStream.showText("Razorpay Order ID: " + payment.getRazorpayOrderId());
                contentStream.endText();
            }

            document.save(outputStream);
            return outputStream.toByteArray();
        }
    }
}
