package com.dishly.app.repositories;

import com.dishly.app.models.RecipeModel;
import com.dishly.app.models.ReviewModel;
import com.dishly.app.models.UserModel;
import com.dishly.app.projection.RatingSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<ReviewModel, Long> {
    List<ReviewModel> findByRecipe(RecipeModel recipe);
    Optional<ReviewModel> findByRecipeAndUser(RecipeModel recipe, UserModel user);


    @Query("""
       SELECT AVG(r.rating) AS avgRating,
              COUNT(r)      AS reviewCount
       FROM   ReviewModel r
       WHERE  r.recipe.id = :recipeId
       """)
    RatingSummary getSummaryByRecipeId(@Param("recipeId") Long recipeId);
}