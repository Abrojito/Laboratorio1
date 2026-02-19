package com.dishly.app.controllers;

import com.dishly.app.dto.PagedResponse;
import com.dishly.app.dto.RecipeResponseDTO;
import com.dishly.app.security.JwtUtil;
import com.dishly.app.services.FavoriteRecipeService;
import com.dishly.app.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/favorites/recipes")
@RequiredArgsConstructor
public class FavoriteRecipeController {

    private final FavoriteRecipeService favoriteService;
    private final JwtUtil jwtUtil;
    private final UserService userService;

    @PostMapping("/{recipeId}")
    public void toggleFavorite(@PathVariable Long recipeId,
                               @RequestHeader("Authorization") String token) {
        String email = jwtUtil.getEmailFromHeader(token);
        favoriteService.toggleFavorite(email, recipeId);
    }

    @GetMapping
    public Page<RecipeResponseDTO> getMyFavRecipes(Authentication auth,
                                                   Pageable pageable) {
        Long uid = userService.getIdByEmail(auth.getName());
        return favoriteService.getFavRecipes(uid, pageable);
    }

    @GetMapping("/cursor")
    public PagedResponse<RecipeResponseDTO> getMyFavRecipesByCursor(
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "10") int limit,
            @RequestHeader("Authorization") String token) {
        String email = jwtUtil.getEmailFromHeader(token);
        return favoriteService.getFavRecipesByCursor(email, cursor, limit);
    }

    @GetMapping("/{recipeId}")
    public boolean isFavorite(@PathVariable Long recipeId,
                              @RequestHeader("Authorization") String token) {
        String email = jwtUtil.getEmailFromHeader(token);
        return favoriteService.isFavorite(email, recipeId);
    }

    @DeleteMapping("/{recipeId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeFavorite(@PathVariable Long recipeId,
                               @RequestHeader("Authorization") String token) {
        String email = jwtUtil.getEmailFromHeader(token);
        favoriteService.removeFavoriteRecipe(email, recipeId);
    }
}
