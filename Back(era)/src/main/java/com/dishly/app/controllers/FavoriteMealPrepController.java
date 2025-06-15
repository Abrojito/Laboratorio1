package com.dishly.app.controllers;

import com.dishly.app.dto.MealPrepResponseDTO;
import com.dishly.app.security.JwtUtil;
import com.dishly.app.services.FavoriteMealPrepService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/favorites/mealpreps")
@RequiredArgsConstructor
public class FavoriteMealPrepController {

    private final FavoriteMealPrepService favoriteService;
    private final JwtUtil jwtUtil;

    @PostMapping("/{mealPrepId}")
    public void toggleFavorite(@PathVariable Long mealPrepId,
                               @RequestHeader("Authorization") String token) {
        String email = jwtUtil.getEmailFromHeader(token);
        favoriteService.toggleFavorite(email, mealPrepId);
    }

    @GetMapping
    public List<MealPrepResponseDTO> getFavorites(@RequestHeader("Authorization") String token) {
        String email = jwtUtil.getEmailFromHeader(token);
        return favoriteService.getFavorites(email);
    }

    @GetMapping("/{mealPrepId}/check")
    public boolean isFavorite(@PathVariable Long mealPrepId,
                              @RequestHeader("Authorization") String token) {
        String email = jwtUtil.getEmailFromHeader(token);
        return favoriteService.isFavorite(email, mealPrepId);
    }
}
