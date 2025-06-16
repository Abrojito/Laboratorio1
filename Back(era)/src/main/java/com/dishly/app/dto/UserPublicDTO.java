package com.dishly.app.dto;

import java.util.List;

public record UserPublicDTO(
        Long id,
        String username,
        String fullName,
        String photo,
        int followersCount,
        int followingCount,
        List<RecipeResponseDTO> publicRecipes,
        List<MealPrepResponseDTO> publicMealPreps,
        boolean followedByMe
) {}

