package com.rentafurniture.user.dto;

import com.rentafurniture.user.entity.Role;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private LocalDate dob;
    private String mobile;
    private Role role;
    private LocalDateTime createdOn;
}
