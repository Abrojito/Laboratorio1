package com.dishly.app.dto;

import java.util.List;

public record MealPrepRequestDTO(
        String name,
        String description,
        String image,
        Boolean publicMealPrep,
        List<Long> recipeIds
) {}

