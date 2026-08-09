package com.rentafurniture.furniture.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rentafurniture.exception.FurnitureNotFoundException;
import com.rentafurniture.exception.GlobalExceptionHandler;
import com.rentafurniture.furniture.dto.FurnitureResponse;
import com.rentafurniture.furniture.service.FurnitureService;
import com.rentafurniture.security.CustomUserDetailsService;
import com.rentafurniture.security.config.SecurityConfig;
import com.rentafurniture.security.jwt.JwtAuthFilter;
import com.rentafurniture.security.jwt.JwtUtil;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(FurnitureController.class)
@Import({GlobalExceptionHandler.class, SecurityConfig.class, JwtAuthFilter.class})
class FurnitureControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @MockBean FurnitureService furnitureService;
    @MockBean JwtUtil jwtUtil;
    @MockBean CustomUserDetailsService customUserDetailsService;

    @Test
    void getAllFurniture_public_returns200() throws Exception {
        FurnitureResponse item = FurnitureResponse.builder()
                .id(1L).fname("Sofa").pricePerMonth(BigDecimal.valueOf(500)).build();
        when(furnitureService.getAllFurniture(any(), any(), any(), any())).thenReturn(List.of(item));

        mockMvc.perform(get("/api/furniture"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].fname").value("Sofa"));
    }

    @Test
    void getFurnitureById_notFound_returns404() throws Exception {
        when(furnitureService.getFurnitureById(99L)).thenThrow(new FurnitureNotFoundException(99L));

        mockMvc.perform(get("/api/furniture/99"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void toggleVerification_asAdmin_returns200() throws Exception {
        FurnitureResponse response = FurnitureResponse.builder()
                .id(1L).fname("Sofa").verified(true).pricePerMonth(BigDecimal.valueOf(500)).build();
        when(furnitureService.toggleVerification(1L)).thenReturn(response);

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders
                        .patch("/api/furniture/1/verify"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.verified").value(true));
    }
}
