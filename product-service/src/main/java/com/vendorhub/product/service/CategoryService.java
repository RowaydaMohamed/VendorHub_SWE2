package com.vendorhub.product.service;

import com.vendorhub.product.dto.CategoryDTOs.*;
import com.vendorhub.product.entity.Category;
import com.vendorhub.product.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryResponse create(CategoryRequest req) {
        Category category = Category.builder()
                .name(req.getName())
                .build();
        category = categoryRepository.save(category);
        return new CategoryResponse(category.getId(), category.getName());
    }

    public List<CategoryResponse> getAll() {
        return categoryRepository.findAll()
                .stream()
                .map(c -> new CategoryResponse(c.getId(), c.getName()))
                .toList();
    }
}