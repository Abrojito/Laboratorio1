package com.dishly.app.dto;

import java.util.List;

public record ShoppingListRequestDTO(
        String name,
        List<Long> recipeIds,
        List<Long> mealPrepIds
) {}
