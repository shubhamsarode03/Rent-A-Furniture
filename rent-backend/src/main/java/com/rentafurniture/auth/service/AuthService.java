package com.rentafurniture.auth.service;

import com.rentafurniture.auth.dto.AuthResponse;
import com.rentafurniture.user.dto.LoginRequest;
import com.rentafurniture.user.dto.RegisterRequest;

import jakarta.servlet.http.HttpServletResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    AuthResponse getCurrentUser(String email);
    void setAuthCookie(HttpServletResponse response, String token);
    void clearAuthCookie(HttpServletResponse response);
}
