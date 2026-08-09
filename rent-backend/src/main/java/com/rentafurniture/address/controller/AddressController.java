package com.rentafurniture.address.controller;

import com.rentafurniture.address.dto.AddressRequest;
import com.rentafurniture.address.dto.AddressResponse;
import com.rentafurniture.address.service.AddressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('RENTER', 'LENDER')")
public class AddressController {

    private final AddressService addressService;

    @GetMapping
    public ResponseEntity<List<AddressResponse>> getAddresses(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(addressService.getAddresses(userDetails.getUsername()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AddressResponse> getAddress(@PathVariable Long id,
                                                     @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(addressService.getAddress(id, userDetails.getUsername()));
    }

    @PostMapping
    public ResponseEntity<AddressResponse> createAddress(@Valid @RequestBody AddressRequest request,
                                                         @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(addressService.createAddress(request, userDetails.getUsername()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AddressResponse> updateAddress(@PathVariable Long id,
                                                         @Valid @RequestBody AddressRequest request,
                                                         @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(addressService.updateAddress(id, request, userDetails.getUsername()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAddress(@PathVariable Long id,
                                              @AuthenticationPrincipal UserDetails userDetails) {
        addressService.deleteAddress(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}
