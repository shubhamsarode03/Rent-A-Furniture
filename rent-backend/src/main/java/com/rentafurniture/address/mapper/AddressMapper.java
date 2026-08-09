package com.rentafurniture.address.mapper;

import com.rentafurniture.address.dto.AddressResponse;
import com.rentafurniture.address.entity.Address;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AddressMapper {
    AddressResponse toResponse(Address address);
}
