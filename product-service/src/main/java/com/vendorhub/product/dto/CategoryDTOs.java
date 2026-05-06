package com.vendorhub.product.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

public class CategoryDTOs {

    @Getter
    @Setter
    public static class CategoryRequest {
        @NotBlank(message = "Category name is required")
        private String name;
    }

    @Getter
    @AllArgsConstructor
    public static class CategoryResponse {
        private Long id;
        private String name;
    }
}