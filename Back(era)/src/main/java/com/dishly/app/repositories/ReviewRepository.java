package com.dishly.app.repositories;

import com.dishly.app.models.RecipeModel;
import com.dishly.app.models.ReviewModel;
import com.dishly.app.models.UserModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<ReviewModel, Long> {
    List<ReviewModel> findByRecipe(RecipeModel recipe);
    Optional<ReviewModel> findByRecipeAndUser(RecipeModel recipe, UserModel user);
}