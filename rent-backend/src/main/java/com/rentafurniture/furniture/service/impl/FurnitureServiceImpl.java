package com.rentafurniture.furniture.service.impl;

import com.rentafurniture.category.entity.Category;
import com.rentafurniture.category.repository.CategoryRepository;
import com.rentafurniture.exception.FurnitureNotFoundException;
import com.rentafurniture.exception.InvalidFurnitureStatusException;
import com.rentafurniture.exception.UnauthorizedFurnitureAccessException;
import com.rentafurniture.exception.UserNotFoundException;
import com.rentafurniture.furniture.dto.FurnitureRequest;
import com.rentafurniture.furniture.dto.FurnitureResponse;
import com.rentafurniture.furniture.entity.Furniture;
import com.rentafurniture.furniture.entity.FurnitureStatus;
import com.rentafurniture.furniture.mapper.FurnitureMapper;
import com.rentafurniture.furniture.repository.FurnitureRepository;
import com.rentafurniture.furniture.service.FurnitureService;
import com.rentafurniture.user.entity.Role;
import com.rentafurniture.user.entity.User;
import com.rentafurniture.user.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FurnitureServiceImpl implements FurnitureService {

    private final FurnitureRepository furnitureRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final FurnitureMapper furnitureMapper;

    @Override
    @Transactional
    public FurnitureResponse createFurniture(FurnitureRequest request, String ownerEmail) {
        User owner = findUserByEmail(ownerEmail);
        Category category = findCategoryById(request.getCategoryId());

        Furniture furniture = Furniture.builder()
                .owner(owner)
                .category(category)
                .fname(request.getFname())
                .description(request.getDescription())
                .pricePerMonth(request.getPricePerMonth())
                .status(FurnitureStatus.PENDING_APPROVAL)
                .build();
        return furnitureMapper.toResponse(furnitureRepository.save(furniture));
    }

    @Override
    public FurnitureResponse getFurnitureById(Long id, String userEmail) {
        Furniture furniture = findById(id);
        User user = findUserByEmail(userEmail);

        // Public users can only view AVAILABLE furniture
        if (furniture.getStatus() != FurnitureStatus.AVAILABLE &&
            !furniture.getOwner().getId().equals(user.getId()) &&
            user.getRole() != Role.ADMIN) {
            throw new FurnitureNotFoundException(id);
        }

        return furnitureMapper.toResponse(furniture);
    }

    @Override
    public Page<FurnitureResponse> getPublicFurniture(Long categoryId, BigDecimal minPrice, BigDecimal maxPrice, String search, Pageable pageable) {
        return furnitureRepository.findPublicFurniture(FurnitureStatus.AVAILABLE, categoryId, minPrice, maxPrice, search, pageable)
                .map(furnitureMapper::toResponse);
    }

    @Override
    public Page<FurnitureResponse> getAllFurnitureForOwner(String ownerEmail, FurnitureStatus status, String search, Pageable pageable) {
        User owner = findUserByEmail(ownerEmail);
        return furnitureRepository.findByOwnerIdWithFilters(owner.getId(), status, search, pageable)
                .map(furnitureMapper::toResponse);
    }

    @Override
    public Page<FurnitureResponse> getAllFurnitureForAdmin(FurnitureStatus status, String search, Pageable pageable) {
        return furnitureRepository.findWithFilters(null, null, null, status, search, pageable)
                .map(furnitureMapper::toResponse);
    }

    @Override
    @Transactional
    public FurnitureResponse updateFurniture(Long id, FurnitureRequest request, String ownerEmail) {
        Furniture furniture = findById(id);
        User owner = findUserByEmail(ownerEmail);
        
        if (!furniture.getOwner().getId().equals(owner.getId())) {
            throw new UnauthorizedFurnitureAccessException();
        }
        
        // Only allow updates for non-rented furniture
        if (furniture.getStatus() == FurnitureStatus.RENTED) {
            throw new InvalidFurnitureStatusException("Cannot update furniture that is currently rented");
        }
        
        furniture.setCategory(findCategoryById(request.getCategoryId()));
        furniture.setFname(request.getFname());
        furniture.setDescription(request.getDescription());
        furniture.setPricePerMonth(request.getPricePerMonth());
        
        return furnitureMapper.toResponse(furnitureRepository.save(furniture));
    }

    @Override
    @Transactional
    public void deleteFurniture(Long id, String ownerEmail) {
        Furniture furniture = findById(id);
        User owner = findUserByEmail(ownerEmail);
        
        if (!furniture.getOwner().getId().equals(owner.getId())) {
            throw new UnauthorizedFurnitureAccessException();
        }
        
        // Only allow deletion of non-rented furniture
        if (furniture.getStatus() == FurnitureStatus.RENTED) {
            throw new InvalidFurnitureStatusException("Cannot delete furniture that is currently rented");
        }
        
        // Actually delete the furniture instead of setting to INACTIVE
        furnitureRepository.delete(furniture);
    }

    @Override
    @Transactional
    public FurnitureResponse approveFurniture(Long id) {
        Furniture furniture = findById(id);
        
        if (furniture.getStatus() != FurnitureStatus.PENDING_APPROVAL) {
            throw new InvalidFurnitureStatusException("Furniture is not pending approval");
        }
        
        furniture.setStatus(FurnitureStatus.AVAILABLE);
        return furnitureMapper.toResponse(furnitureRepository.save(furniture));
    }

    @Override
    @Transactional
    public FurnitureResponse rejectFurniture(Long id) {
        Furniture furniture = findById(id);
        
        if (furniture.getStatus() != FurnitureStatus.PENDING_APPROVAL) {
            throw new InvalidFurnitureStatusException("Furniture is not pending approval");
        }
        
        furniture.setStatus(FurnitureStatus.REJECTED);
        return furnitureMapper.toResponse(furnitureRepository.save(furniture));
    }

    @Override
    @Transactional
    public FurnitureResponse markAsRented(Long id) {
        Furniture furniture = findById(id);
        
        if (furniture.getStatus() != FurnitureStatus.AVAILABLE) {
            throw new InvalidFurnitureStatusException("Furniture is not available for rent");
        }
        
        furniture.setStatus(FurnitureStatus.RENTED);
        return furnitureMapper.toResponse(furnitureRepository.save(furniture));
    }

    @Override
    @Transactional
    public FurnitureResponse markAsAvailable(Long id) {
        Furniture furniture = findById(id);
        
        if (furniture.getStatus() != FurnitureStatus.RENTED) {
            throw new InvalidFurnitureStatusException("Furniture is not currently rented");
        }
        
        furniture.setStatus(FurnitureStatus.AVAILABLE);
        return furnitureMapper.toResponse(furnitureRepository.save(furniture));
    }

    private Furniture findById(Long id) {
        return furnitureRepository.findById(id).orElseThrow(() -> new FurnitureNotFoundException(id));
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email).orElseThrow(() -> new UserNotFoundException(email));
    }

    private Category findCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Category not found with id: " + id));
    }
}
