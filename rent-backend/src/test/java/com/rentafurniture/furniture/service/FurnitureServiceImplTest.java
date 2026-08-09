package com.rentafurniture.furniture.service;

import com.rentafurniture.category.entity.Category;
import com.rentafurniture.category.repository.CategoryRepository;
import com.rentafurniture.exception.FurnitureNotFoundException;
import com.rentafurniture.exception.UnauthorizedFurnitureAccessException;
import com.rentafurniture.furniture.dto.FurnitureRequest;
import com.rentafurniture.furniture.dto.FurnitureResponse;
import com.rentafurniture.furniture.entity.Furniture;
import com.rentafurniture.furniture.mapper.FurnitureMapper;
import com.rentafurniture.furniture.repository.FurnitureRepository;
import com.rentafurniture.furniture.service.impl.FurnitureServiceImpl;
import com.rentafurniture.user.entity.Role;
import com.rentafurniture.user.entity.User;
import com.rentafurniture.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FurnitureServiceImplTest {

    @Mock FurnitureRepository furnitureRepository;
    @Mock UserRepository userRepository;
    @Mock CategoryRepository categoryRepository;
    @Mock FurnitureMapper furnitureMapper;
    @InjectMocks FurnitureServiceImpl furnitureService;

    private User buildUser(Long id, String email) {
        return User.builder().id(id).email(email).role(Role.LENDER).build();
    }

    private Category buildCategory(Long id) {
        return Category.builder().id(id).name("Living Room").build();
    }

    private Furniture buildFurniture(Long id, User owner) {
        return Furniture.builder().id(id).owner(owner).category(buildCategory(1L))
                .fname("Sofa").pricePerMonth(BigDecimal.valueOf(500)).build();
    }

    @Test
    void createFurniture_success() {
        FurnitureRequest request = new FurnitureRequest(1L, "Sofa", "Nice sofa", BigDecimal.valueOf(500));
        User owner = buildUser(1L, "lender@test.com");
        Category category = buildCategory(1L);
        Furniture saved = buildFurniture(1L, owner);
        FurnitureResponse response = new FurnitureResponse();

        when(userRepository.findByEmail("lender@test.com")).thenReturn(Optional.of(owner));
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(furnitureRepository.save(any())).thenReturn(saved);
        when(furnitureMapper.toResponse(saved)).thenReturn(response);

        FurnitureResponse result = furnitureService.createFurniture(request, "lender@test.com");
        assertNotNull(result);
    }

    @Test
    void getFurnitureById_notFound_throwsException() {
        when(furnitureRepository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(FurnitureNotFoundException.class, () -> furnitureService.getFurnitureById(99L));
    }

    @Test
    void deleteFurniture_byNonOwner_throwsException() {
        User owner = buildUser(1L, "owner@test.com");
        User other = buildUser(2L, "other@test.com");
        Furniture furniture = buildFurniture(1L, owner);

        when(furnitureRepository.findById(1L)).thenReturn(Optional.of(furniture));
        when(userRepository.findByEmail("other@test.com")).thenReturn(Optional.of(other));

        assertThrows(UnauthorizedFurnitureAccessException.class,
                () -> furnitureService.deleteFurniture(1L, "other@test.com"));
    }

    @Test
    void toggleVerification_flipsVerifiedFlag() {
        User owner = buildUser(1L, "lender@test.com");
        Furniture furniture = buildFurniture(1L, owner);
        furniture.setVerified(false);
        FurnitureResponse response = new FurnitureResponse();

        when(furnitureRepository.findById(1L)).thenReturn(Optional.of(furniture));
        when(furnitureRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(furnitureMapper.toResponse(any())).thenReturn(response);

        furnitureService.toggleVerification(1L);
        assertTrue(furniture.isVerified());
    }
}
