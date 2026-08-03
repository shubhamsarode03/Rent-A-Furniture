package com.rentafurniture.auth.dto;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    // id and userId carry the same value; id added so the frontend can use either
    private Long id;
    private Long userId;
    private String token;
    private String email;
    private String firstName;
    private String lastName;
    private String role;
}
