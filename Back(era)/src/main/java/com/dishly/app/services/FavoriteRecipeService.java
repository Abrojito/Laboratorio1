package com.dishly.app.services;

import com.dishly.app.dto.PagedResponse;
import com.dishly.app.dto.RecipeResponseDTO;
import com.dishly.app.models.FavoriteRecipeModel;
import com.dishly.app.models.IngredientModel;
import com.dishly.app.models.RecipeModel;
import com.dishly.app.models.UserModel;
import com.dishly.app.repositories.FavoriteRecipeRepository;
import com.dishly.app.repositories.RecipeRepository;
import com.dishly.app.repositories.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

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
        Set<Long> undesiredIngredientIds = user.getUndesiredIngredients().stream()
                .map(IngredientModel::getId)
                .collect(Collectors.toSet());

        return favoriteRepo.findByUser(user).stream()
                .map(fav -> recipeService.toDTO(fav.getRecipe(), undesiredIngredientIds))
                .toList();
    }

    public boolean isFavorite(String email, Long recipeId) {
        UserModel user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        RecipeModel recipe = recipeRepo.findById(recipeId)
                .orElseThrow(() -> new RuntimeException("Receta no encontrada"));
        return favoriteRepo.existsByUserAndRecipe(user, recipe);
    }

    @Transactional
    public void removeFavoriteRecipe(String email, Long recipeId) {
        UserModel user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        RecipeModel recipe = recipeRepo.findById(recipeId)
                .orElseThrow(() -> new RuntimeException("Receta no encontrada"));

        if (favoriteRepo.existsByUserAndRecipe(user, recipe)) {
            favoriteRepo.deleteByUserAndRecipe(user, recipe);
        }
    }

    @Transactional
    public Page<RecipeResponseDTO> getFavRecipes(Long userId, Pageable pageable) {
        Set<Long> undesiredIngredientIds = userRepo.findById(userId)
                .map(u -> u.getUndesiredIngredients().stream()
                        .map(IngredientModel::getId)
                        .collect(Collectors.toSet()))
                .orElse(Set.of());
        return favoriteRepo.findByUserId(userId, pageable)
                .map(fr -> recipeService.toDTO(fr.getRecipe(), undesiredIngredientIds));
    }

    @Transactional
    public PagedResponse<RecipeResponseDTO> getFavRecipesByCursor(String email, String cursor, int limit) {
        UserModel user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        Set<Long> undesiredIngredientIds = user.getUndesiredIngredients().stream()
                .map(IngredientModel::getId)
                .collect(Collectors.toSet());

        int safeLimit = limit > 0 ? limit : 10;
        Pageable pageable = PageRequest.of(0, safeLimit + 1);

        List<FavoriteRecipeModel> favModels;
        if (cursor == null || cursor.isBlank()) {
            favModels = favoriteRepo.findByUserIdOrderByIdDesc(user.getId(), pageable);
        } else {
            Long cursorId = Long.parseLong(cursor);
            favModels = favoriteRepo.findByUserIdAndIdLessThanOrderByIdDesc(user.getId(), cursorId, pageable);
        }

        boolean hasNext = favModels.size() > safeLimit;
        List<FavoriteRecipeModel> pageModels = hasNext
                ? favModels.subList(0, safeLimit)
                : favModels;

        List<RecipeResponseDTO> items = pageModels.stream()
                .map(fr -> recipeService.toDTO(fr.getRecipe(), undesiredIngredientIds))
                .toList();

        String nextCursor = hasNext && !pageModels.isEmpty()
                ? String.valueOf(pageModels.get(pageModels.size() - 1).getId())
                : null;

        return new PagedResponse<>(items, nextCursor, hasNext);
    }
}
