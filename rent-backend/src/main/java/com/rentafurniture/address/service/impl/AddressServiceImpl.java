package com.rentafurniture.address.service.impl;

import com.rentafurniture.address.dto.AddressRequest;
import com.rentafurniture.address.dto.AddressResponse;
import com.rentafurniture.address.entity.Address;
import com.rentafurniture.address.mapper.AddressMapper;
import com.rentafurniture.address.repository.AddressRepository;
import com.rentafurniture.address.service.AddressService;
import com.rentafurniture.exception.AddressNotFoundException;
import com.rentafurniture.exception.UserNotFoundException;
import com.rentafurniture.user.entity.User;
import com.rentafurniture.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AddressServiceImpl implements AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;
    private final AddressMapper addressMapper;

    @Override
    @Transactional
    public AddressResponse createAddress(AddressRequest request, String userEmail) {
        User user = findUserByEmail(userEmail);

        // If setting as default, unset existing default
        if (Boolean.TRUE.equals(request.getIsDefault())) {
            addressRepository.findByUserIdAndIsDefaultTrue(user.getId())
                    .ifPresent(addr -> {
                        addr.setIsDefault(false);
                        addressRepository.save(addr);
                    });
        }

        // Build address entity manually like CartServiceImpl does
        Address address = Address.builder()
                .user(user)
                .fullName(request.getFullName())
                .phoneNumber(request.getPhoneNumber())
                .addressLine1(request.getAddressLine1())
                .addressLine2(request.getAddressLine2())
                .city(request.getCity())
                .state(request.getState())
                .postalCode(request.getPostalCode())
                .country(request.getCountry())
                .isDefault(request.getIsDefault())
                .build();

        // If no addresses exist, make this the default
        if (addressRepository.findByUserId(user.getId()).isEmpty()) {
            address.setIsDefault(true);
        } else if (request.getIsDefault() == null) {
            address.setIsDefault(false);
        }

        return addressMapper.toResponse(addressRepository.save(address));
    }

    @Override
    @Transactional
    public AddressResponse updateAddress(Long id, AddressRequest request, String userEmail) {
        User user = findUserByEmail(userEmail);
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new AddressNotFoundException(id));

        if (!address.getUser().getId().equals(user.getId())) {
            throw new AddressNotFoundException("Address does not belong to this user");
        }

        if (Boolean.TRUE.equals(request.getIsDefault())) {
            addressRepository.findByUserIdAndIsDefaultTrue(user.getId())
                    .ifPresent(addr -> {
                        addr.setIsDefault(false);
                        addressRepository.save(addr);
                    });
        }

        // Update fields manually
        if (request.getFullName() != null) address.setFullName(request.getFullName());
        if (request.getPhoneNumber() != null) address.setPhoneNumber(request.getPhoneNumber());
        if (request.getAddressLine1() != null) address.setAddressLine1(request.getAddressLine1());
        if (request.getAddressLine2() != null) address.setAddressLine2(request.getAddressLine2());
        if (request.getCity() != null) address.setCity(request.getCity());
        if (request.getState() != null) address.setState(request.getState());
        if (request.getPostalCode() != null) address.setPostalCode(request.getPostalCode());
        if (request.getCountry() != null) address.setCountry(request.getCountry());
        if (request.getIsDefault() != null) address.setIsDefault(request.getIsDefault());

        return addressMapper.toResponse(addressRepository.save(address));
    }

    @Override
    @Transactional
    public void deleteAddress(Long id, String userEmail) {
        User user = findUserByEmail(userEmail);
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new AddressNotFoundException(id));

        if (!address.getUser().getId().equals(user.getId())) {
            throw new AddressNotFoundException("Address does not belong to this user");
        }

        addressRepository.delete(address);
    }

    @Override
    public List<AddressResponse> getAddresses(String userEmail) {
        User user = findUserByEmail(userEmail);
        return addressRepository.findByUserId(user.getId()).stream()
                .map(addressMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public AddressResponse getAddress(Long id, String userEmail) {
        User user = findUserByEmail(userEmail);
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new AddressNotFoundException(id));

        if (!address.getUser().getId().equals(user.getId())) {
            throw new AddressNotFoundException("Address does not belong to this user");
        }

        return addressMapper.toResponse(address);
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email).orElseThrow(() -> new UserNotFoundException(email));
    }
}
