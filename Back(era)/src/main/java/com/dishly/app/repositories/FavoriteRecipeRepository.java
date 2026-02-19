package com.dishly.app.repositories;

import com.dishly.app.models.FavoriteRecipeModel;
import com.dishly.app.models.RecipeModel;
import com.dishly.app.models.UserModel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FavoriteRecipeRepository extends JpaRepository<FavoriteRecipeModel, Long> {
    boolean existsByUserAndRecipe(UserModel user, RecipeModel recipe);
    void deleteByUserAndRecipe(UserModel user, RecipeModel recipe);
    List<FavoriteRecipeModel> findByUser(UserModel user);
    Page<FavoriteRecipeModel> findByUserId(Long userId, Pageable pageable);
    List<FavoriteRecipeModel> findByUserIdOrderByIdDesc(Long userId, Pageable pageable);
    List<FavoriteRecipeModel> findByUserIdAndIdLessThanOrderByIdDesc(Long userId, Long cursorId, Pageable pageable);
}
