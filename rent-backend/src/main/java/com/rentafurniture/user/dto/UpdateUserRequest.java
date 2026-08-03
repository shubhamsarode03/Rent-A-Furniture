package com.rentafurniture.user.dto;

import jakarta.validation.constraints.Pattern;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserRequest {
    private String firstName;
    private String lastName;
    private LocalDate dob;

    @Pattern(regexp = "^\\d{10}$", message = "Mobile must be 10 digits")
    private String mobile;
}
