package com.rentafurniture.order.service.impl;

import com.rentafurniture.exception.OrderNotFoundException;
import com.rentafurniture.exception.UserNotFoundException;
import com.rentafurniture.order.entity.Order;
import com.rentafurniture.order.entity.OrderDetails;
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
import org.springframework.transaction.annotation.Transactional;

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
    @Transactional(readOnly = true)
    public ResponseEntity<byte[]> generateInvoice(Long orderId, String userEmail) {
        try {
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
                throw new RuntimeException("Invoice can only be generated for confirmed orders. Current status: " + order.getStatus());
            }

            Payment payment = paymentRepository.findByOrderIdAndStatus(orderId, PaymentStatus.SUCCESS)
                    .orElseThrow(() -> new RuntimeException("No successful payment found for this order"));

            byte[] pdfBytes = generatePdfInvoice(order, payment);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "invoice_" + order.getId() + ".pdf");

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to generate invoice: " + e.getMessage(), e);
        }
    }

    private byte[] generatePdfInvoice(Order order, Payment payment) throws IOException {
        try (PDDocument document = new PDDocument();
             ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

            PDPage page = new PDPage();
            document.addPage(page);

            try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
                // Header with separator line
                contentStream.setFont(PDType1Font.HELVETICA_BOLD, 18);
                contentStream.beginText();
                contentStream.newLineAtOffset(50, 750);
                contentStream.showText("RENT-A-FURNITURE");
                contentStream.endText();

                contentStream.setFont(PDType1Font.HELVETICA, 12);
                contentStream.beginText();
                contentStream.newLineAtOffset(50, 730);
                contentStream.showText("FURNITURE RENTAL MARKETPLACE");
                contentStream.newLineAtOffset(0, -15);
                contentStream.showText("Pune, Maharashtra");
                contentStream.endText();

                // Draw separator line
                contentStream.moveTo(50, 700);
                contentStream.lineTo(545, 700);
                contentStream.stroke();

                // Invoice title
                contentStream.setFont(PDType1Font.HELVETICA_BOLD, 20);
                contentStream.beginText();
                contentStream.newLineAtOffset(50, 670);
                contentStream.showText("INVOICE");
                contentStream.endText();

                // Invoice details
                contentStream.setFont(PDType1Font.HELVETICA, 11);
                contentStream.beginText();
                contentStream.newLineAtOffset(50, 640);
                contentStream.showText("Invoice Number: INV-" + order.getId());
                contentStream.newLineAtOffset(0, -15);
                contentStream.showText("Order ID: #" + order.getId());
                contentStream.newLineAtOffset(0, -15);
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
                contentStream.showText("Invoice Date: " + order.getCreatedOn().format(formatter));
                contentStream.newLineAtOffset(0, -15);
                contentStream.showText("Invoice Status: PAID");
                contentStream.endText();

                // Customer Details section
                contentStream.setFont(PDType1Font.HELVETICA_BOLD, 12);
                contentStream.beginText();
                contentStream.newLineAtOffset(50, 570);
                contentStream.showText("CUSTOMER DETAILS");
                contentStream.endText();

                // Draw separator line
                contentStream.moveTo(50, 560);
                contentStream.lineTo(545, 560);
                contentStream.stroke();

                contentStream.setFont(PDType1Font.HELVETICA, 11);
                contentStream.beginText();
                contentStream.newLineAtOffset(50, 540);
                contentStream.showText("Name: " + capitalizeWords(order.getDeliveryFullName()));
                contentStream.newLineAtOffset(0, -15);
                contentStream.showText("Email: " + order.getUser().getEmail());
                contentStream.newLineAtOffset(0, -15);
                contentStream.showText("Phone: " + order.getDeliveryPhone());
                contentStream.endText();

                // Delivery Address section
                contentStream.setFont(PDType1Font.HELVETICA_BOLD, 12);
                contentStream.beginText();
                contentStream.newLineAtOffset(50, 490);
                contentStream.showText("DELIVERY ADDRESS");
                contentStream.endText();

                // Draw separator line
                contentStream.moveTo(50, 480);
                contentStream.lineTo(545, 480);
                contentStream.stroke();

                contentStream.setFont(PDType1Font.HELVETICA, 11);
                contentStream.beginText();
                contentStream.newLineAtOffset(50, 460);
                contentStream.showText(order.getDeliveryAddressLine1());
                contentStream.newLineAtOffset(0, -15);
                if (order.getDeliveryAddressLine2() != null && !order.getDeliveryAddressLine2().isEmpty()) {
                    contentStream.showText(order.getDeliveryAddressLine2());
                    contentStream.newLineAtOffset(0, -15);
                }
                contentStream.showText(order.getDeliveryCity() + ", " + order.getDeliveryState() + " - " + order.getDeliveryPostalCode());
                contentStream.newLineAtOffset(0, -15);
                contentStream.showText(order.getDeliveryCountry());
                contentStream.endText();

                // Rental Details section
                contentStream.setFont(PDType1Font.HELVETICA_BOLD, 12);
                contentStream.beginText();
                contentStream.newLineAtOffset(50, 400);
                contentStream.showText("RENTAL DETAILS");
                contentStream.endText();

                // Draw separator line
                contentStream.moveTo(50, 390);
                contentStream.lineTo(545, 390);
                contentStream.stroke();

                float yPosition = 370;
                contentStream.setFont(PDType1Font.HELVETICA, 11);
                for (OrderDetails od : order.getOrderDetails()) {
                    contentStream.beginText();
                    contentStream.newLineAtOffset(50, yPosition);
                    contentStream.showText("Item: " + od.getFurniture().getFname());
                    contentStream.newLineAtOffset(0, -15);
                    contentStream.showText("Furniture ID: FUR-" + od.getFurniture().getId());
                    contentStream.newLineAtOffset(0, -15);
                    contentStream.showText("Quantity: 1");
                    contentStream.newLineAtOffset(0, -20);
                    
                    // Rental dates
                    DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
                    contentStream.showText("Rental Start Date: " + (order.getRentedOn() != null ? order.getRentedOn().format(dateFormatter) : "N/A"));
                    contentStream.newLineAtOffset(0, -15);
                    contentStream.showText("Rental End Date: " + (order.getReturnDate() != null ? order.getReturnDate().format(dateFormatter) : "N/A"));
                    contentStream.newLineAtOffset(0, -15);
                    contentStream.showText("Duration: " + od.getDuration() + " month(s)");
                    contentStream.newLineAtOffset(0, -20);
                    
                    // Pricing with right alignment
                    String formattedPrice = formatPrice(od.getPricePerMonth());
                    String formattedSubtotal = formatPrice(od.getPricePerMonth().multiply(BigDecimal.valueOf(od.getDuration())));
                    
                    contentStream.showText("Monthly Rent:          " + formattedPrice);
                    contentStream.newLineAtOffset(0, -15);
                    contentStream.showText("Delivery Fee:          FREE");
                    contentStream.endText();
                    yPosition -= 115;
                }

                // Draw separator line before total
                contentStream.moveTo(50, yPosition);
                contentStream.lineTo(545, yPosition);
                contentStream.stroke();

                // Total amount
                contentStream.setFont(PDType1Font.HELVETICA_BOLD, 14);
                contentStream.beginText();
                contentStream.newLineAtOffset(50, yPosition - 20);
                contentStream.showText("TOTAL AMOUNT:          " + formatPrice(order.getTotalAmount()));
                contentStream.endText();

                // Payment Details section
                contentStream.setFont(PDType1Font.HELVETICA_BOLD, 12);
                contentStream.beginText();
                contentStream.newLineAtOffset(50, yPosition - 60);
                contentStream.showText("PAYMENT DETAILS");
                contentStream.endText();

                // Draw separator line
                contentStream.moveTo(50, yPosition - 70);
                contentStream.lineTo(545, yPosition - 70);
                contentStream.stroke();

                contentStream.setFont(PDType1Font.HELVETICA, 11);
                contentStream.beginText();
                contentStream.newLineAtOffset(50, yPosition - 90);
                contentStream.showText("Payment Status: " + payment.getStatus());
                contentStream.newLineAtOffset(0, -15);
                contentStream.showText("Payment Method: Razorpay");
                contentStream.newLineAtOffset(0, -15);
                contentStream.showText("Razorpay Payment ID: " + payment.getRazorpayPaymentId());
                contentStream.newLineAtOffset(0, -15);
                contentStream.showText("Razorpay Order ID: " + payment.getRazorpayOrderId());
                contentStream.endText();

                // Thank you message
                contentStream.setFont(PDType1Font.HELVETICA_BOLD, 12);
                contentStream.beginText();
                contentStream.newLineAtOffset(50, yPosition - 150);
                contentStream.showText("Thank you for choosing Rent-A-Furniture.");
                contentStream.endText();

                contentStream.setFont(PDType1Font.HELVETICA, 10);
                contentStream.beginText();
                contentStream.newLineAtOffset(50, yPosition - 170);
                contentStream.showText("For support:");
                contentStream.newLineAtOffset(0, -12);
                contentStream.showText("support@rentafurniture.com");
                contentStream.endText();

                // Footer separator line
                contentStream.moveTo(50, yPosition - 190);
                contentStream.lineTo(545, yPosition - 190);
                contentStream.stroke();
            }

            document.save(outputStream);
            return outputStream.toByteArray();
        }
    }

    private String formatPrice(BigDecimal price) {
        return "INR " + String.format("%,.2f", price);
    }

    private String capitalizeWords(String input) {
        if (input == null || input.isEmpty()) {
            return input;
        }
        String[] words = input.split("\\s+");
        StringBuilder result = new StringBuilder();
        for (String word : words) {
            if (word.length() > 0) {
                result.append(Character.toUpperCase(word.charAt(0)))
                       .append(word.substring(1).toLowerCase())
                       .append(" ");
            }
        }
        return result.toString().trim();
    }
}
