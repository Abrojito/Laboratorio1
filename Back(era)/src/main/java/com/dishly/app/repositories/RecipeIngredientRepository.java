package com.dishly.app.repositories;

import com.dishly.app.models.RecipeIngredientModel;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RecipeIngredientRepository extends JpaRepository<RecipeIngredientModel, Long> {
}
