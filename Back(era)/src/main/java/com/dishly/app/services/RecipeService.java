package com.dishly.app.services;

import com.dishly.app.models.RecipeModel;
import com.dishly.app.repositories.RecipeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RecipeService {
    @Autowired
    private RecipeRepository repository;

    public List<RecipeModel> getAll() {
        return repository.findAll();
    }

    public Optional<RecipeModel> getById(Long id) {
        return repository.findById(id);
    }

    public List<RecipeModel> searchByName(String term) {
        return repository.findByNameContainingIgnoreCase(term);
    }

    public List<RecipeModel> findByCategory(String category) {
        return repository.findByCategoryIgnoreCase(category);
    }

    public List<RecipeModel> findByAuthorId(Long authorId) {
        return repository.findByUserId(authorId);
    }

    public RecipeModel save(RecipeModel recipe) {
        return repository.save(recipe);
    }

    public Optional<RecipeModel> update(Long id, RecipeModel recipe) {
        return repository.findById(id)
                .map(existingRecipe -> {
                    recipe.setId(id);
                    return repository.save(recipe);
                });
    }

    public void deleteById(Long id) {
        repository.deleteById(id);
    }
}
