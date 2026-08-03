package com.rentafurniture.user.mapper;

import com.rentafurniture.user.dto.UserResponse;
import com.rentafurniture.user.entity.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserResponse toResponse(User user);
}
