package com.rentafurniture.order.service;

import com.rentafurniture.cart.repository.CartRepository;
import com.rentafurniture.exception.OrderNotFoundException;
import com.rentafurniture.furniture.entity.Furniture;
import com.rentafurniture.furniture.repository.FurnitureRepository;
import com.rentafurniture.order.dto.OrderRequest;
import com.rentafurniture.order.dto.OrderResponse;
import com.rentafurniture.order.entity.Order;
import com.rentafurniture.order.entity.OrderDetails;
import com.rentafurniture.order.entity.OrderStatus;
import com.rentafurniture.order.repository.OrderRepository;
import com.rentafurniture.order.service.impl.OrderServiceImpl;
import com.rentafurniture.user.entity.Role;
import com.rentafurniture.user.entity.User;
import com.rentafurniture.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceImplTest {

    @Mock OrderRepository orderRepository;
    @Mock UserRepository userRepository;
    @Mock FurnitureRepository furnitureRepository;
    @Mock CartRepository cartRepository;
    @InjectMocks OrderServiceImpl orderService;

    private User buildUser(Long id, String email, Role role) {
        return User.builder().id(id).email(email).role(role).build();
    }

    private Furniture buildFurniture(Long id, BigDecimal price) {
        return Furniture.builder().id(id).fname("Sofa").pricePerMonth(price).build();
    }

    @Test
    void createOrder_success() {
        User user = buildUser(1L, "renter@test.com", Role.RENTER);
        Furniture furniture = buildFurniture(1L, BigDecimal.valueOf(500));

        OrderRequest request = new OrderRequest(
                LocalDate.now(), LocalDate.now().plusMonths(2),
                List.of(new OrderRequest.OrderItemRequest(1L, 2)));

        Order savedOrder = Order.builder()
                .id(1L).user(user).totalAmount(BigDecimal.valueOf(1000))
                .status(OrderStatus.PENDING)
                .orderDetails(new ArrayList<>(List.of(
                        OrderDetails.builder().id(1L).furniture(furniture)
                                .pricePerMonth(BigDecimal.valueOf(500)).duration(2).build())))
                .build();

        when(userRepository.findByEmail("renter@test.com")).thenReturn(Optional.of(user));
        when(furnitureRepository.findById(1L)).thenReturn(Optional.of(furniture));
        when(orderRepository.save(any())).thenReturn(savedOrder);

        OrderResponse response = orderService.createOrder(request, "renter@test.com");
        assertNotNull(response);
        assertEquals(OrderStatus.PENDING, response.getStatus());
        verify(cartRepository).deleteByUserId(1L);
    }

    @Test
    void getOrderById_notFound_throwsException() {
        User user = buildUser(1L, "renter@test.com", Role.RENTER);
        when(userRepository.findByEmail("renter@test.com")).thenReturn(Optional.of(user));
        when(orderRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(OrderNotFoundException.class, () -> orderService.getOrderById(99L, "renter@test.com"));
    }

    @Test
    void updateOrderStatus_success() {
        Order order = Order.builder().id(1L).status(OrderStatus.PENDING)
                .user(buildUser(1L, "renter@test.com", Role.RENTER))
                .orderDetails(new ArrayList<>())
                .totalAmount(BigDecimal.valueOf(500)).build();

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        OrderResponse response = orderService.updateOrderStatus(1L, OrderStatus.ACTIVE);
        assertEquals(OrderStatus.ACTIVE, response.getStatus());
    }
}
