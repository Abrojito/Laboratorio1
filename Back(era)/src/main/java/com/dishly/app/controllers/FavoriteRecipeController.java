package com.dishly.app.controllers;

import com.dishly.app.dto.RecipeResponseDTO;
import com.dishly.app.security.JwtUtil;
import com.dishly.app.services.FavoriteRecipeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/favorites/recipes")
@RequiredArgsConstructor
public class FavoriteRecipeController {

    private final FavoriteRecipeService favoriteService;
    private final JwtUtil jwtUtil;

    @PostMapping("/{recipeId}")
    public void toggleFavorite(@PathVariable Long recipeId,
                               @RequestHeader("Authorization") String token) {
        String email = jwtUtil.getEmailFromHeader(token);
        favoriteService.toggleFavorite(email, recipeId);
    }

    @GetMapping
    public List<RecipeResponseDTO> getFavorites(@RequestHeader("Authorization") String token) {
        String email = jwtUtil.getEmailFromHeader(token);
        return favoriteService.getFavorites(email);
    }

    @GetMapping("/{recipeId}")
    public boolean isFavorite(@PathVariable Long recipeId,
                              @RequestHeader("Authorization") String token) {
        String email = jwtUtil.getEmailFromHeader(token);
        return favoriteService.isFavorite(email, recipeId);
    }
}

