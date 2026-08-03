package com.rentafurniture.cart.service;

import com.rentafurniture.cart.dto.CartItemRequest;
import com.rentafurniture.cart.dto.CartResponse;
import com.rentafurniture.cart.entity.Cart;
import com.rentafurniture.cart.mapper.CartMapper;
import com.rentafurniture.cart.repository.CartRepository;
import com.rentafurniture.cart.service.impl.CartServiceImpl;
import com.rentafurniture.exception.CartItemNotFoundException;
import com.rentafurniture.furniture.entity.Furniture;
import com.rentafurniture.furniture.repository.FurnitureRepository;
import com.rentafurniture.user.entity.Role;
import com.rentafurniture.user.entity.User;
import com.rentafurniture.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CartServiceImplTest {

    @Mock CartRepository cartRepository;
    @Mock UserRepository userRepository;
    @Mock FurnitureRepository furnitureRepository;
    @Mock CartMapper cartMapper;
    @InjectMocks CartServiceImpl cartService;

    private User buildUser(Long id, String email) {
        return User.builder().id(id).email(email).role(Role.RENTER).build();
    }

    private Furniture buildFurniture(Long id) {
        return Furniture.builder().id(id).fname("Sofa").pricePerMonth(BigDecimal.valueOf(500)).build();
    }

    @Test
    void addToCart_success() {
        CartItemRequest request = new CartItemRequest(1L);
        User user = buildUser(1L, "renter@test.com");
        Furniture furniture = buildFurniture(1L);
        Cart cart = Cart.builder().id(1L).user(user).furniture(furniture).build();
        CartResponse response = new CartResponse();

        when(userRepository.findByEmail("renter@test.com")).thenReturn(Optional.of(user));
        when(furnitureRepository.findById(1L)).thenReturn(Optional.of(furniture));
        when(cartRepository.findByUserIdAndFurnitureId(1L, 1L)).thenReturn(Optional.empty());
        when(cartRepository.save(any())).thenReturn(cart);
        when(cartMapper.toResponse(cart)).thenReturn(response);

        CartResponse result = cartService.addToCart(request, "renter@test.com");
        assertNotNull(result);
    }

    @Test
    void addToCart_duplicateItem_throwsException() {
        CartItemRequest request = new CartItemRequest(1L);
        User user = buildUser(1L, "renter@test.com");
        Furniture furniture = buildFurniture(1L);
        Cart existing = Cart.builder().id(1L).user(user).furniture(furniture).build();

        when(userRepository.findByEmail("renter@test.com")).thenReturn(Optional.of(user));
        when(furnitureRepository.findById(1L)).thenReturn(Optional.of(furniture));
        when(cartRepository.findByUserIdAndFurnitureId(1L, 1L)).thenReturn(Optional.of(existing));

        assertThrows(IllegalStateException.class, () -> cartService.addToCart(request, "renter@test.com"));
    }

    @Test
    void getCart_returnsItems() {
        User user = buildUser(1L, "renter@test.com");
        when(userRepository.findByEmail("renter@test.com")).thenReturn(Optional.of(user));
        when(cartRepository.findByUserId(1L)).thenReturn(List.of());

        List<CartResponse> cart = cartService.getCart("renter@test.com");
        assertNotNull(cart);
    }

    @Test
    void removeFromCart_wrongUser_throwsException() {
        User user1 = buildUser(1L, "renter1@test.com");
        User user2 = buildUser(2L, "renter2@test.com");
        Furniture furniture = buildFurniture(1L);
        Cart cart = Cart.builder().id(1L).user(user1).furniture(furniture).build();

        when(userRepository.findByEmail("renter2@test.com")).thenReturn(Optional.of(user2));
        when(cartRepository.findById(1L)).thenReturn(Optional.of(cart));

        assertThrows(CartItemNotFoundException.class,
                () -> cartService.removeFromCart(1L, "renter2@test.com"));
    }
}
