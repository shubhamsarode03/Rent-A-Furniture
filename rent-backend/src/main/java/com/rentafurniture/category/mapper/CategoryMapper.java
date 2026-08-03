package com.rentafurniture.category.mapper;

import com.rentafurniture.category.dto.CategoryResponse;
import com.rentafurniture.category.entity.Category;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CategoryMapper {
    CategoryResponse toResponse(Category category);
}
