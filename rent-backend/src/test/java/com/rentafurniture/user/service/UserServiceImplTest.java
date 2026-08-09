package com.rentafurniture.user.service;

import com.rentafurniture.exception.UserNotFoundException;
import com.rentafurniture.user.dto.UpdateUserRequest;
import com.rentafurniture.user.dto.UserResponse;
import com.rentafurniture.user.entity.Role;
import com.rentafurniture.user.entity.User;
import com.rentafurniture.user.mapper.UserMapper;
import com.rentafurniture.user.repository.UserRepository;
import com.rentafurniture.user.service.impl.UserServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock UserRepository userRepository;
    @Mock UserMapper userMapper;
    @InjectMocks UserServiceImpl userService;

    private User buildUser(Long id) {
        return User.builder().id(id).firstName("John").lastName("Doe")
                .email("john@test.com").role(Role.RENTER).build();
    }

    @Test
    void getUserById_found() {
        User user = buildUser(1L);
        UserResponse response = new UserResponse();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userMapper.toResponse(user)).thenReturn(response);

        UserResponse result = userService.getUserById(1L);
        assertNotNull(result);
    }

    @Test
    void getUserById_notFound_throwsException() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(UserNotFoundException.class, () -> userService.getUserById(99L));
    }

    @Test
    void getAllUsers_returnsList() {
        when(userRepository.findAll()).thenReturn(List.of(buildUser(1L)));
        when(userMapper.toResponse(any())).thenReturn(new UserResponse());

        List<UserResponse> users = userService.getAllUsers();
        assertEquals(1, users.size());
    }

    @Test
    void updateUser_updatesFields() {
        User user = buildUser(1L);
        UpdateUserRequest request = new UpdateUserRequest("Jane", null, null, null);
        UserResponse response = new UserResponse();

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRepository.save(any())).thenReturn(user);
        when(userMapper.toResponse(user)).thenReturn(response);

        UserResponse result = userService.updateUser(1L, request);
        assertEquals("Jane", user.getFirstName());
        assertNotNull(result);
    }

    @Test
    void deleteUser_notFound_throwsException() {
        when(userRepository.existsById(99L)).thenReturn(false);
        assertThrows(UserNotFoundException.class, () -> userService.deleteUser(99L));
    }
}
