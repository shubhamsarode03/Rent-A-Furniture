package com.rentafurniture.address.service;

import com.rentafurniture.address.dto.AddressRequest;
import com.rentafurniture.address.dto.AddressResponse;
import com.rentafurniture.address.entity.Address;

import java.util.List;

public interface AddressService {
    AddressResponse createAddress(AddressRequest request, String userEmail);
    AddressResponse updateAddress(Long id, AddressRequest request, String userEmail);
    void deleteAddress(Long id, String userEmail);
    List<AddressResponse> getAddresses(String userEmail);
    AddressResponse getAddress(Long id, String userEmail);
}
