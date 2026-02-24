package com.dishly.app.controllers;

import com.dishly.app.dto.MealPrepResponseDTO;
import com.dishly.app.dto.PagedResponse;
import com.dishly.app.dto.RecipeResponseDTO;
import com.dishly.app.services.MealPrepService;
import com.dishly.app.services.RecipeService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final RecipeService recipeService;
    private final MealPrepService mealPrepService;

    @GetMapping("/recipes/cursor")
    public PagedResponse<RecipeResponseDTO> searchRecipesByCursor(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String ingredient,
            @RequestParam(required = false) String author,
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "10") int limit,
            Authentication auth
    ) {
        String email = auth != null ? auth.getName() : null;
        return recipeService.searchByCursor(name, ingredient, author, cursor, limit, email, false, false);
    }

    @GetMapping("/mealpreps/cursor")
    public PagedResponse<MealPrepResponseDTO> searchMealPrepsByCursor(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String ingredient,
            @RequestParam(required = false) String author,
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "10") int limit,
            Authentication auth
    ) {
        String email = auth != null ? auth.getName() : null;
        return mealPrepService.searchByCursor(name, ingredient, author, cursor, limit, email, false, false);
    }
}
