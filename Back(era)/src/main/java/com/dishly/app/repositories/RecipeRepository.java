package com.dishly.app.repositories;

import com.dishly.app.models.IngredientModel;
import com.dishly.app.models.RecipeModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RecipeRepository extends JpaRepository<RecipeModel, Long> {
    List<RecipeModel> findByNameContainingIgnoreCase(String name);

    // Búsqueda por categoría
    List<RecipeModel> findByCategoryIgnoreCase(String category);

    // Búsqueda por dificultad
    //List<RecipeModel> findByDifficulty(String difficulty);

    // Búsqueda por usuario/autor
    List<RecipeModel> findByUserId(Long userId);

    boolean existsByName(String name);

    List<RecipeModel> findByPublicRecipeTrue();
}