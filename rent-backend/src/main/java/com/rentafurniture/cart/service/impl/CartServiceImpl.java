package com.rentafurniture.cart.service.impl;

import com.rentafurniture.cart.dto.CartItemRequest;
import com.rentafurniture.cart.dto.CartResponse;
import com.rentafurniture.cart.entity.Cart;
import com.rentafurniture.cart.mapper.CartMapper;
import com.rentafurniture.cart.repository.CartRepository;
import com.rentafurniture.cart.service.CartService;
import com.rentafurniture.exception.CartItemNotFoundException;
import com.rentafurniture.exception.CannotRentOwnFurnitureException;
import com.rentafurniture.exception.FurnitureNotFoundException;
import com.rentafurniture.exception.InvalidFurnitureStatusException;
import com.rentafurniture.exception.UserNotFoundException;
import com.rentafurniture.furniture.entity.Furniture;
import com.rentafurniture.furniture.entity.FurnitureStatus;
import com.rentafurniture.furniture.repository.FurnitureRepository;
import com.rentafurniture.user.entity.User;
import com.rentafurniture.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final FurnitureRepository furnitureRepository;
    private final CartMapper cartMapper;

    @Override
    public CartResponse addToCart(CartItemRequest request, String userEmail) {
        User user = findUserByEmail(userEmail);
        Furniture furniture = furnitureRepository.findById(request.getFurnitureId())
                .orElseThrow(() -> new FurnitureNotFoundException(request.getFurnitureId()));

        // Validate furniture status
        if (furniture.getStatus() != FurnitureStatus.AVAILABLE) {
            throw new InvalidFurnitureStatusException("Furniture is not available for rent. Current status: " + furniture.getStatus());
        }

        // Prevent users from adding their own furniture to cart
        if (furniture.getOwner().getId().equals(user.getId())) {
            throw new CannotRentOwnFurnitureException("You cannot rent your own furniture");
        }

        // Check if already in cart
        cartRepository.findByUserIdAndFurnitureId(user.getId(), furniture.getId())
                .ifPresent(c -> { throw new IllegalStateException("Item already in cart"); });

        Cart cart = Cart.builder().user(user).furniture(furniture).build();
        return cartMapper.toResponse(cartRepository.save(cart));
    }

    @Override
    public List<CartResponse> getCart(String userEmail) {
        User user = findUserByEmail(userEmail);
        return cartRepository.findByUserId(user.getId()).stream()
                .map(cartMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void removeFromCart(Long cartItemId, String userEmail) {
        User user = findUserByEmail(userEmail);
        Cart cart = cartRepository.findById(cartItemId)
                .orElseThrow(() -> new CartItemNotFoundException(cartItemId));
        if (!cart.getUser().getId().equals(user.getId())) {
            throw new CartItemNotFoundException("Cart item does not belong to this user");
        }
        cartRepository.deleteById(cartItemId);
    }

    @Override
    @Transactional
    public void clearCart(String userEmail) {
        User user = findUserByEmail(userEmail);
        cartRepository.deleteByUserId(user.getId());
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email).orElseThrow(() -> new UserNotFoundException(email));
    }
}
