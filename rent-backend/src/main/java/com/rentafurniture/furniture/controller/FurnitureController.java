package com.rentafurniture.furniture.controller;

import com.rentafurniture.furniture.dto.FurnitureRequest;
import com.rentafurniture.furniture.dto.FurnitureResponse;
import com.rentafurniture.furniture.entity.FurnitureStatus;
import com.rentafurniture.furniture.service.FurnitureService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/furniture")
@RequiredArgsConstructor
public class FurnitureController {

    private final FurnitureService furnitureService;

    /**
     * Helper method to parse sort string in format "property,direction" or "property"
     * Defaults to ascending direction if not specified
     */
    private Sort parseSort(String sort) {
        if (sort == null || sort.trim().isEmpty()) {
            return Sort.by(Sort.Direction.DESC, "createdOn");
        }

        String[] parts = sort.split(",");
        String property = parts[0].trim();
        Sort.Direction direction = Sort.Direction.DESC; // Default to DESC

        if (parts.length > 1) {
            String dir = parts[1].trim().toUpperCase();
            if (dir.equals("ASC") || dir.equals("DESC")) {
                direction = Sort.Direction.valueOf(dir);
            }
        }

        return Sort.by(direction, property);
    }

    @GetMapping("/public")
    public ResponseEntity<Page<FurnitureResponse>> getPublicFurniture(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createdOn,desc") String sort) {

        Pageable pageable = PageRequest.of(page, size, parseSort(sort));
        return ResponseEntity.ok(furnitureService.getPublicFurniture(categoryId, minPrice, maxPrice, search, pageable));
    }

    @GetMapping("/public/{id}")
    public ResponseEntity<FurnitureResponse> getPublicFurnitureById(@PathVariable Long id) {
        return ResponseEntity.ok(furnitureService.getPublicFurnitureById(id));
    }

    @GetMapping("/owner")
    @PreAuthorize("hasRole('LENDER')")
    public ResponseEntity<Page<FurnitureResponse>> getOwnerFurniture(
            @RequestParam(required = false) FurnitureStatus status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createdOn,desc") String sort,
            @AuthenticationPrincipal UserDetails userDetails) {

        Pageable pageable = PageRequest.of(page, size, parseSort(sort));
        return ResponseEntity.ok(furnitureService.getAllFurnitureForOwner(userDetails.getUsername(), status, search, pageable));
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<FurnitureResponse>> getAdminFurniture(
            @RequestParam(required = false) FurnitureStatus status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createdOn,desc") String sort) {

        Pageable pageable = PageRequest.of(page, size, parseSort(sort));
        return ResponseEntity.ok(furnitureService.getAllFurnitureForAdmin(status, search, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FurnitureResponse> getById(@PathVariable Long id,
                                                     @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(furnitureService.getFurnitureById(id, userDetails.getUsername()));
    }

    @PostMapping
    @PreAuthorize("hasRole('LENDER')")
    public ResponseEntity<FurnitureResponse> create(@Valid @RequestBody FurnitureRequest request,
                                                     @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(furnitureService.createFurniture(request, userDetails.getUsername()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('LENDER')")
    public ResponseEntity<FurnitureResponse> update(@PathVariable Long id,
                                                     @Valid @RequestBody FurnitureRequest request,
                                                     @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(furnitureService.updateFurniture(id, request, userDetails.getUsername()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('LENDER') or hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id,
                                        @AuthenticationPrincipal UserDetails userDetails) {
        furnitureService.deleteFurniture(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FurnitureResponse> approveFurniture(@PathVariable Long id) {
        return ResponseEntity.ok(furnitureService.approveFurniture(id));
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FurnitureResponse> rejectFurniture(@PathVariable Long id) {
        return ResponseEntity.ok(furnitureService.rejectFurniture(id));
    }

    @PatchMapping("/{id}/rent")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FurnitureResponse> markAsRented(@PathVariable Long id) {
        return ResponseEntity.ok(furnitureService.markAsRented(id));
    }

    @PatchMapping("/{id}/available")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FurnitureResponse> markAsAvailable(@PathVariable Long id) {
        return ResponseEntity.ok(furnitureService.markAsAvailable(id));
    }
}
