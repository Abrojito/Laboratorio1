package com.dishly.app.dto;

import java.util.List;

public record RecipeRequestDTO(
        String name,
        String description,
        String image,          // Base64 o URL
        String category,
        String author,
        Long   userId,
        String time,
        List<IngredientQuantityDTO> ingredients,
        List<String> steps,
        Boolean publicRecipe
) {}

