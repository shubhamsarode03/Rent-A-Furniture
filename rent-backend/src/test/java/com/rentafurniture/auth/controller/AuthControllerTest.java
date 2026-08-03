package com.rentafurniture.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rentafurniture.auth.dto.AuthResponse;
import com.rentafurniture.auth.service.AuthService;
import com.rentafurniture.exception.GlobalExceptionHandler;
import com.rentafurniture.security.CustomUserDetailsService;
import com.rentafurniture.security.config.SecurityConfig;
import com.rentafurniture.security.jwt.JwtAuthFilter;
import com.rentafurniture.security.jwt.JwtUtil;
import com.rentafurniture.user.dto.LoginRequest;
import com.rentafurniture.user.dto.RegisterRequest;
import com.rentafurniture.user.entity.Role;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@Import({GlobalExceptionHandler.class, SecurityConfig.class, JwtAuthFilter.class})
class AuthControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @MockBean AuthService authService;
    @MockBean JwtUtil jwtUtil;
    @MockBean CustomUserDetailsService customUserDetailsService;

    @Test
    void register_validRequest_returns201() throws Exception {
        RegisterRequest request = new RegisterRequest("John", "Doe", "john@test.com",
                "password123", null, "1234567890", Role.RENTER);
        AuthResponse response = AuthResponse.builder()
                .token("jwt").email("john@test.com").role("RENTER").userId(1L).build();

        when(authService.register(any())).thenReturn(response);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").value("jwt"))
                .andExpect(jsonPath("$.email").value("john@test.com"));
    }

    @Test
    void register_invalidEmail_returns400() throws Exception {
        RegisterRequest request = new RegisterRequest("John", "Doe", "not-an-email",
                "password123", null, null, Role.RENTER);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void login_validRequest_returns200() throws Exception {
        LoginRequest request = new LoginRequest("john@test.com", "password");
        AuthResponse response = AuthResponse.builder()
                .token("jwt").email("john@test.com").role("RENTER").userId(1L).build();

        when(authService.login(any())).thenReturn(response);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt"));
    }

    @Test
    void login_missingPassword_returns400() throws Exception {
        LoginRequest request = new LoginRequest("john@test.com", "");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}
