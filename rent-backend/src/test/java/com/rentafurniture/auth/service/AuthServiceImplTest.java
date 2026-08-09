package com.rentafurniture.auth.service;

import com.rentafurniture.auth.dto.AuthResponse;
import com.rentafurniture.auth.service.impl.AuthServiceImpl;
import com.rentafurniture.exception.DuplicateEmailException;
import com.rentafurniture.exception.InvalidCredentialsException;
import com.rentafurniture.security.jwt.JwtUtil;
import com.rentafurniture.user.dto.LoginRequest;
import com.rentafurniture.user.dto.RegisterRequest;
import com.rentafurniture.user.entity.Role;
import com.rentafurniture.user.entity.User;
import com.rentafurniture.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock UserRepository userRepository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock JwtUtil jwtUtil;
    @InjectMocks AuthServiceImpl authService;

    @Test
    void register_success() {
        RegisterRequest request = new RegisterRequest("John", "Doe", "john@test.com",
                "password123", null, "1234567890", Role.RENTER);

        when(userRepository.existsByEmail(request.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(any())).thenReturn("encoded");
        when(userRepository.save(any())).thenReturn(
                User.builder().id(1L).email(request.getEmail()).role(Role.RENTER).build());
        when(jwtUtil.generateToken(any(), any(), any())).thenReturn("jwt-token");

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("jwt-token", response.getToken());
        assertEquals("john@test.com", response.getEmail());
    }

    @Test
    void register_duplicateEmail_throwsException() {
        RegisterRequest request = new RegisterRequest("John", "Doe", "john@test.com",
                "password", null, null, Role.RENTER);
        when(userRepository.existsByEmail(request.getEmail())).thenReturn(true);

        assertThrows(DuplicateEmailException.class, () -> authService.register(request));
    }

    @Test
    void register_asAdmin_throwsException() {
        RegisterRequest request = new RegisterRequest("John", "Doe", "john@test.com",
                "password", null, null, Role.ADMIN);

        assertThrows(InvalidCredentialsException.class, () -> authService.register(request));
    }

    @Test
    void login_success() {
        LoginRequest request = new LoginRequest("john@test.com", "password");
        User user = User.builder().id(1L).email("john@test.com").password("encoded").role(Role.RENTER).build();

        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(request.getPassword(), user.getPassword())).thenReturn(true);
        when(jwtUtil.generateToken(any(), any(), any())).thenReturn("jwt-token");

        AuthResponse response = authService.login(request);
        assertEquals("jwt-token", response.getToken());
    }

    @Test
    void login_wrongPassword_throwsException() {
        LoginRequest request = new LoginRequest("john@test.com", "wrongPassword");
        User user = User.builder().id(1L).email("john@test.com").password("encoded").role(Role.RENTER).build();

        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(any(), any())).thenReturn(false);

        assertThrows(InvalidCredentialsException.class, () -> authService.login(request));
    }
}
