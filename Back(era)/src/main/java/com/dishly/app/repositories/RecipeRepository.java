package com.dishly.app.repositories;

import com.dishly.app.models.IngredientModel;
import com.dishly.app.models.RecipeModel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

    Page<RecipeModel> findByUserId(Long userId, Pageable pageable);

    boolean existsByName(String name);

    List<RecipeModel> findByPublicRecipeTrue();

    List<RecipeModel> findByUserIdAndPublicRecipeTrue(Long userId);

    Page<RecipeModel> findByPublicRecipeTrue(Pageable pageable);

    List<RecipeModel> findByPublicRecipeTrueOrderByIdDesc(Pageable pageable);

    List<RecipeModel> findByPublicRecipeTrueAndIdLessThanOrderByIdDesc(Long cursorId, Pageable pageable);

    List<RecipeModel> findByUserIdAndPublicRecipeTrueOrderByIdDesc(Long userId, Pageable pageable);

    List<RecipeModel> findByUserIdAndPublicRecipeTrueAndIdLessThanOrderByIdDesc(Long userId, Long cursorId, Pageable pageable);
}
