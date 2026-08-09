package com.rentafurniture.order.service.impl;

import com.rentafurniture.address.entity.Address;
import com.rentafurniture.address.repository.AddressRepository;
import com.rentafurniture.cart.repository.CartRepository;
import com.rentafurniture.exception.CannotRentOwnFurnitureException;
import com.rentafurniture.exception.FurnitureNotFoundException;
import com.rentafurniture.exception.InvalidFurnitureStatusException;
import com.rentafurniture.exception.InvalidOrderStateException;
import com.rentafurniture.exception.OrderNotFoundException;
import com.rentafurniture.exception.UserNotFoundException;
import com.rentafurniture.furniture.entity.Furniture;
import com.rentafurniture.furniture.entity.FurnitureStatus;
import com.rentafurniture.furniture.repository.FurnitureRepository;
import com.rentafurniture.order.dto.OrderDetailsResponse;
import com.rentafurniture.order.dto.OrderRequest;
import com.rentafurniture.order.dto.OrderResponse;
import com.rentafurniture.order.entity.Order;
import com.rentafurniture.order.entity.OrderDetails;
import com.rentafurniture.order.entity.OrderStatus;
import com.rentafurniture.order.repository.OrderRepository;
import com.rentafurniture.order.service.OrderService;
import com.rentafurniture.user.entity.Role;
import com.rentafurniture.user.entity.User;
import com.rentafurniture.user.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final FurnitureRepository furnitureRepository;
    private final CartRepository cartRepository;
    private final AddressRepository addressRepository;

    @Override
    @Transactional
    public OrderResponse createOrder(OrderRequest request, String userEmail) {
        User user = findUserByEmail(userEmail);

        // Validate and get address
        Address address = addressRepository.findById(request.getAddressId())
                .orElseThrow(() -> new RuntimeException("Address not found"));

        if (!address.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Address does not belong to this user");
        }

        // Validate returnDate matches duration for all items
        for (OrderRequest.OrderItemRequest item : request.getItems()) {
            LocalDate expectedReturnDate = request.getRentedOn().plusMonths(item.getDurationMonths());
            long daysDifference = Math.abs(
                ChronoUnit.DAYS.between(expectedReturnDate, request.getReturnDate())
            );
            if (daysDifference > 5) { // Allow 5 days tolerance for month boundary issues
                throw new InvalidOrderStateException(
                    "Return date does not match selected duration of " + item.getDurationMonths() + " month(s)"
                );
            }
        }

        List<OrderDetails> detailsList = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        Order order = Order.builder()
                .user(user)
                .status(OrderStatus.PENDING)
                .rentedOn(request.getRentedOn())
                .returnDate(request.getReturnDate())
                .totalAmount(BigDecimal.ZERO)
                .deliveryFee(BigDecimal.ZERO) // Free delivery
                .build();

        // Capture address snapshot
        order.setDeliveryFullName(request.getDeliveryFullName() != null ? request.getDeliveryFullName() : address.getFullName());
        order.setDeliveryPhone(request.getDeliveryPhone() != null ? request.getDeliveryPhone() : address.getPhoneNumber());
        order.setDeliveryAddressLine1(request.getDeliveryAddressLine1() != null ? request.getDeliveryAddressLine1() : address.getAddressLine1());
        order.setDeliveryAddressLine2(request.getDeliveryAddressLine2() != null ? request.getDeliveryAddressLine2() : address.getAddressLine2());
        order.setDeliveryCity(request.getDeliveryCity() != null ? request.getDeliveryCity() : address.getCity());
        order.setDeliveryState(request.getDeliveryState() != null ? request.getDeliveryState() : address.getState());
        order.setDeliveryPostalCode(request.getDeliveryPostalCode() != null ? request.getDeliveryPostalCode() : address.getPostalCode());
        order.setDeliveryCountry(request.getDeliveryCountry() != null ? request.getDeliveryCountry() : address.getCountry());

        for (OrderRequest.OrderItemRequest item : request.getItems()) {
            Furniture furniture = furnitureRepository.findById(item.getFurnitureId())
                    .orElseThrow(() -> new FurnitureNotFoundException(item.getFurnitureId()));

            // Validate furniture status
            if (furniture.getStatus() != FurnitureStatus.AVAILABLE) {
                throw new InvalidFurnitureStatusException("Furniture is not available for rent. Current status: " + furniture.getStatus());
            }

            // Prevent users from ordering their own furniture
            if (furniture.getOwner().getId().equals(user.getId())) {
                throw new CannotRentOwnFurnitureException("You cannot rent your own furniture");
            }

            OrderDetails details = OrderDetails.builder()
                    .order(order)
                    .furniture(furniture)
                    .pricePerMonth(furniture.getPricePerMonth())
                    .duration(item.getDurationMonths())
                    .build();
            detailsList.add(details);
            totalAmount = totalAmount.add(
                    furniture.getPricePerMonth().multiply(BigDecimal.valueOf(item.getDurationMonths()))
            );
        }

        order.setTotalAmount(totalAmount);
        order.setOrderDetails(detailsList);
        Order saved = orderRepository.save(order);

        // DO NOT clear cart here - cart is cleared only after successful payment
        // cartRepository.deleteByUserId(user.getId());

        return toOrderResponse(saved);
    }

    @Override
    @Transactional
    public void clearCartAfterSuccessfulPayment(String userEmail) {
        User user = findUserByEmail(userEmail);
        cartRepository.deleteByUserId(user.getId());
    }

    @Override
    public OrderResponse getOrderById(Long id, String userEmail) {
        User user = findUserByEmail(userEmail);
        Order order = orderRepository.findById(id).orElseThrow(() -> new OrderNotFoundException(id));
        // RENTER and LENDER can only see their own orders; ADMIN can see all
        if (user.getRole() != Role.ADMIN && !order.getUser().getId().equals(user.getId())) {
            throw new OrderNotFoundException(id);
        }
        return toOrderResponse(order);
    }

    @Override
    public Page<OrderResponse> getOrdersForUser(String userEmail, Pageable pageable) {
        User user = findUserByEmail(userEmail);
        return orderRepository.findByUserId(user.getId(), pageable)
                .map(this::toOrderResponse);
    }

    @Override
    public Page<OrderResponse> getAllOrders(OrderStatus status, LocalDate startDate, LocalDate endDate, Pageable pageable) {
        return orderRepository.findWithFilters(status, startDate, endDate, pageable)
                .map(this::toOrderResponse);
    }

    @Override
    @Transactional
    public OrderResponse updateOrderStatus(Long id, OrderStatus status) {
        Order order = orderRepository.findById(id).orElseThrow(() -> new OrderNotFoundException(id));
        order.setStatus(status);
        return toOrderResponse(orderRepository.save(order));
    }

    @Override
    @Transactional
    public OrderResponse completeRental(Long id) {
        Order order = orderRepository.findById(id).orElseThrow(() -> new OrderNotFoundException(id));

        if (order.getStatus() != OrderStatus.ACTIVE && order.getStatus() != OrderStatus.CONFIRMED) {
            throw new InvalidOrderStateException("Order must be ACTIVE or CONFIRMED to complete rental");
        }

        order.setStatus(OrderStatus.COMPLETED);

        // Mark all furniture in the order as AVAILABLE again
        for (OrderDetails orderDetails : order.getOrderDetails()) {
            Furniture furniture = orderDetails.getFurniture();
            if (furniture.getStatus() == FurnitureStatus.RENTED) {
                furniture.setStatus(FurnitureStatus.AVAILABLE);
                furnitureRepository.save(furniture);
            }
        }

        return toOrderResponse(orderRepository.save(order));
    }

    @Override
    @Transactional
    public OrderResponse retryPayment(Long id, String userEmail) {
        User user = findUserByEmail(userEmail);
        Order order = orderRepository.findById(id).orElseThrow(() -> new OrderNotFoundException(id));

        // Verify user owns this order
        if (!order.getUser().getId().equals(user.getId())) {
            throw new OrderNotFoundException(id);
        }

        // Only allow retry for PAYMENT_FAILED orders
        if (order.getStatus() != OrderStatus.PAYMENT_FAILED) {
            throw new InvalidOrderStateException("Only orders with PAYMENT_FAILED status can retry payment");
        }

        // Reset order status to PENDING for payment retry
        order.setStatus(OrderStatus.PENDING);
        return toOrderResponse(orderRepository.save(order));
    }

    @Override
    @Transactional
    public OrderResponse cancelOrder(Long id, String userEmail, String reason) {
        User user = findUserByEmail(userEmail);
        Order order = orderRepository.findById(id).orElseThrow(() -> new OrderNotFoundException(id));

        // Verify user owns this order (unless admin)
        if (user.getRole() != Role.ADMIN && !order.getUser().getId().equals(user.getId())) {
            throw new OrderNotFoundException(id);
        }

        // Store original status for cart clearing logic
        OrderStatus originalStatus = order.getStatus();

        // Validate state transition
        validateStateTransition(originalStatus, OrderStatus.CANCELLED);

        // Cancel the order
        order.setStatus(OrderStatus.CANCELLED);
        Order saved = orderRepository.save(order);

        // Clear cart if in PENDING or PAYMENT_FAILED state
        if (originalStatus == OrderStatus.PENDING || originalStatus == OrderStatus.PAYMENT_FAILED) {
            cartRepository.deleteByUserId(user.getId());
        }

        // If CONFIRMED → CANCELLED, furniture stays RENTED until returned (refund handling in future)
        // No furniture status change here - handled by return process

        return toOrderResponse(saved);
    }

    @Override
    @Transactional
    public OrderResponse activateOrder(Long id, String deliveryNotes) {
        Order order = orderRepository.findById(id).orElseThrow(() -> new OrderNotFoundException(id));

        // Validate transition - only CONFIRMED orders can be activated
        if (order.getStatus() != OrderStatus.CONFIRMED) {
            throw new InvalidOrderStateException("Only CONFIRMED orders can be activated. Current status: " + order.getStatus());
        }

        // Activate the order
        order.setStatus(OrderStatus.ACTIVE);
        return toOrderResponse(orderRepository.save(order));
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email).orElseThrow(() -> new UserNotFoundException(email));
    }

    private void validateStateTransition(OrderStatus from, OrderStatus to) {
        switch (from) {
            case PENDING:
                if (to != OrderStatus.CONFIRMED &&
                    to != OrderStatus.PAYMENT_FAILED &&
                    to != OrderStatus.CANCELLED) {
                    throw new InvalidOrderStateException(
                        "Invalid transition from PENDING to " + to
                    );
                }
                break;
            case PAYMENT_FAILED:
                if (to != OrderStatus.PENDING && to != OrderStatus.CANCELLED) {
                    throw new InvalidOrderStateException(
                        "Invalid transition from PAYMENT_FAILED to " + to
                    );
                }
                break;
            case CONFIRMED:
                if (to != OrderStatus.ACTIVE && to != OrderStatus.CANCELLED) {
                    throw new InvalidOrderStateException(
                        "Invalid transition from CONFIRMED to " + to
                    );
                }
                break;
            case ACTIVE:
                if (to != OrderStatus.COMPLETED && to != OrderStatus.CANCELLED) {
                    throw new InvalidOrderStateException(
                        "Invalid transition from ACTIVE to " + to
                    );
                }
                break;
            case COMPLETED:
            case CANCELLED:
                throw new InvalidOrderStateException(
                    "Cannot transition from terminal state " + from
                );
            default:
                throw new InvalidOrderStateException(
                    "Unknown order state: " + from
                );
        }
    }

    private OrderResponse toOrderResponse(Order order) {
        List<OrderDetailsResponse> items = order.getOrderDetails().stream()
                .map(od -> OrderDetailsResponse.builder()
                        .id(od.getId())
                        .furnitureId(od.getFurniture().getId())
                        .furnitureName(od.getFurniture().getFname())
                        .pricePerMonth(od.getPricePerMonth())
                        .duration(od.getDuration())
                        .lineTotal(od.getPricePerMonth().multiply(BigDecimal.valueOf(od.getDuration())))
                        .build())
                .collect(Collectors.toList());

        return OrderResponse.builder()
                .id(order.getId())
                .userId(order.getUser().getId())
                .userEmail(order.getUser().getEmail())
                .totalAmount(order.getTotalAmount())
                .deliveryFee(order.getDeliveryFee())
                .status(order.getStatus())
                .rentedOn(order.getRentedOn())
                .returnDate(order.getReturnDate())
                .createdOn(order.getCreatedOn())
                .items(items)
                .deliveryFullName(order.getDeliveryFullName())
                .deliveryPhone(order.getDeliveryPhone())
                .deliveryAddressLine1(order.getDeliveryAddressLine1())
                .deliveryAddressLine2(order.getDeliveryAddressLine2())
                .deliveryCity(order.getDeliveryCity())
                .deliveryState(order.getDeliveryState())
                .deliveryPostalCode(order.getDeliveryPostalCode())
                .deliveryCountry(order.getDeliveryCountry())
                .build();
    }
}
