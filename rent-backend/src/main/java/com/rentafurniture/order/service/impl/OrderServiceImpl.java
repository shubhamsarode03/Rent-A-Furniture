package com.rentafurniture.order.service.impl;

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

    @Override
    @Transactional
    public OrderResponse createOrder(OrderRequest request, String userEmail) {
        User user = findUserByEmail(userEmail);

        List<OrderDetails> detailsList = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        Order order = Order.builder()
                .user(user)
                .status(OrderStatus.PENDING)
                .rentedOn(request.getRentedOn())
                .returnDate(request.getReturnDate())
                .totalAmount(BigDecimal.ZERO)
                .build();

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

        // Clear the user's cart after successful order
        cartRepository.deleteByUserId(user.getId());

        return toOrderResponse(saved);
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

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email).orElseThrow(() -> new UserNotFoundException(email));
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
                .status(order.getStatus())
                .rentedOn(order.getRentedOn())
                .returnDate(order.getReturnDate())
                .createdOn(order.getCreatedOn())
                .items(items)
                .build();
    }
}
