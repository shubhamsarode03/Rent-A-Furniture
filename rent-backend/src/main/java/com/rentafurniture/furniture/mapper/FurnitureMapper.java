package com.rentafurniture.furniture.mapper;

import com.rentafurniture.furniture.dto.FurnitureResponse;
import com.rentafurniture.furniture.entity.Furniture;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface FurnitureMapper {

    @Mapping(source = "owner.id", target = "ownerId")
    @Mapping(source = "owner.firstName", target = "ownerName")
    @Mapping(source = "category.id", target = "categoryId")
    @Mapping(source = "category.name", target = "categoryName")
    @Mapping(source = "status", target = "status")
    @Mapping(source = "imageUrl", target = "imageUrl")
    FurnitureResponse toResponse(Furniture furniture);
}
