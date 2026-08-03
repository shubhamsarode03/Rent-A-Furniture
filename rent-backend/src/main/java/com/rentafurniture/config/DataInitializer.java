package com.rentafurniture.config;

import com.rentafurniture.category.entity.Category;
import com.rentafurniture.category.repository.CategoryRepository;
import com.rentafurniture.user.entity.Role;
import com.rentafurniture.user.entity.User;
import com.rentafurniture.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedAdmin();
        seedCategories();
    }

    private void seedAdmin() {
        if (!userRepository.existsByEmail("admin@rentafurniture.com")) {
            User admin = User.builder()
                    .firstName("Admin")
                    .lastName("User")
                    .email("admin@rentafurniture.com")
                    .password(passwordEncoder.encode("Admin@123"))
                    .role(Role.ADMIN)
                    .build();
            userRepository.save(admin);
            log.info("Default admin user created: admin@rentafurniture.com / Admin@123");
        }
    }

    private void seedCategories() {
        List<String[]> categories = List.of(
                new String[]{"Living Room", "Sofas, coffee tables, entertainment units and more"},
                new String[]{"Bedroom", "Beds, wardrobes, dressing tables and nightstands"},
                new String[]{"Dining", "Dining tables, chairs and sideboards"},
                new String[]{"Office", "Desks, office chairs, bookshelves and storage"},
                new String[]{"Outdoor", "Garden furniture, loungers and outdoor tables"}
        );

        for (String[] cat : categories) {
            if (!categoryRepository.existsByName(cat[0])) {
                categoryRepository.save(Category.builder()
                        .name(cat[0])
                        .description(cat[1])
                        .build());
            }
        }
        log.info("Default categories seeded");
    }
}
