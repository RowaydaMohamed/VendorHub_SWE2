package com.vendorhub.product.config;

import com.vendorhub.product.entity.Category;
import com.vendorhub.product.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;

    @Override
    public void run(String... args) {
        List<String> defaultCategories = List.of(
            "Electronics", "Fashion", "Home & Living", "Sports & Outdoors",
            "Books", "Beauty & Health", "Toys & Games", "Automotive",
            "Food & Beverages", "Office Supplies"
        );

        for (String name : defaultCategories) {
            if (!categoryRepository.existsByName(name)) {
                categoryRepository.save(Category.builder().name(name).build());
                log.info("[SEED] Created category: {}", name);
            }
        }
        log.info("[SEED] Categories ready: {} total", categoryRepository.count());
    }
}