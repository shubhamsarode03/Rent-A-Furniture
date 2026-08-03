package com.rentafurniture.user.service;

import com.rentafurniture.user.dto.UpdateUserRequest;
import com.rentafurniture.user.dto.UserResponse;

import java.util.List;

public interface UserService {
    UserResponse getUserById(Long id);
    List<UserResponse> getAllUsers();
    UserResponse updateUser(Long id, UpdateUserRequest request);
    void deleteUser(Long id);
}
