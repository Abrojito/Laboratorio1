package com.dishly.app.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;
import java.util.Map;

public record RecipeRequestDTO(
        String name,
        String description,
        String image,          // Base64 o URL
        String category,
        String author,
        String time,
        @JsonProperty("ingredientIds") Map<Long, String> ingredients,
        List<String> steps,
        Boolean publicRecipe
) {}

