package com.dishly.app.services;

import com.dishly.app.dto.RecipeResponseDTO;
import com.dishly.app.models.FavoriteRecipeModel;
import com.dishly.app.models.RecipeModel;
import com.dishly.app.models.UserModel;
import com.dishly.app.repositories.FavoriteRecipeRepository;
import com.dishly.app.repositories.RecipeRepository;
import com.dishly.app.repositories.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FavoriteRecipeService {

    private final FavoriteRecipeRepository favoriteRepo;
    private final UserRepository userRepo;
    private final RecipeRepository recipeRepo;
    private final RecipeService recipeService;

    @Transactional
    public void toggleFavorite(String email, Long recipeId) {
        UserModel user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        RecipeModel recipe = recipeRepo.findById(recipeId)
                .orElseThrow(() -> new RuntimeException("Receta no encontrada"));

        if (favoriteRepo.existsByUserAndRecipe(user, recipe)) {
            favoriteRepo.deleteByUserAndRecipe(user, recipe);
        } else {
            FavoriteRecipeModel fav = new FavoriteRecipeModel();
            fav.setUser(user);
            fav.setRecipe(recipe);
            favoriteRepo.save(fav);
        }
    }

    @Transactional
    public List<RecipeResponseDTO> getFavorites(String email) {
        UserModel user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        return favoriteRepo.findByUser(user).stream()
                .map(fav -> recipeService.toDTO(fav.getRecipe()))
                .toList();
    }

    public boolean isFavorite(String email, Long recipeId) {
        UserModel user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        RecipeModel recipe = recipeRepo.findById(recipeId)
                .orElseThrow(() -> new RuntimeException("Receta no encontrada"));
        return favoriteRepo.existsByUserAndRecipe(user, recipe);
    }
}

