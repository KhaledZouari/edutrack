package com.edutrack.edutrack.service;

import com.edutrack.edutrack.dto.request.CategoryRequest;
import com.edutrack.edutrack.dto.response.CategoryResponse;

import java.util.List;

/*
 * Interface = contrat métier.
 *
 * Le controller dépend de cette abstraction,
 * pas directement de l'implémentation.
 *
 * C'est une bonne pratique SOLID.
 */
public interface CategoryService {

    CategoryResponse createCategory(CategoryRequest request);

    CategoryResponse updateCategory(Long id, CategoryRequest request);

    List<CategoryResponse> getAllCategories();

    List<CategoryResponse> getCategoryTree();

    CategoryResponse getCategoryById(Long id);

    void deleteCategory(Long id);
}