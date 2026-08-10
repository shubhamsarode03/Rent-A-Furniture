package com.rentafurniture.cart.mapper;

import com.rentafurniture.cart.dto.CartResponse;
import com.rentafurniture.cart.entity.Cart;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CartMapper {

    @Mapping(source = "furniture.id", target = "furnitureId")
    @Mapping(source = "furniture.fname", target = "furnitureName")
    @Mapping(source = "furniture.pricePerMonth", target = "pricePerMonth")
    @Mapping(source = "furniture.status", target = "status")
    @Mapping(source = "furniture.imageUrl", target = "imageUrl")
    @Mapping(source = "furniture.category.name", target = "categoryName")
    CartResponse toResponse(Cart cart);
}
