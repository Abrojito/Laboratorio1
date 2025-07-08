package com.dishly.app.dto;

import java.util.List;

public record RecipeResponseDTO(
        Long   id,
        String name,
        String description,
        String image,
        String category,
        String author,
        String authorPhoto,
        Long   userId,
        String time,
        List<IngredientQuantityDTO> ingredients,
        List<String> steps,
        Boolean publicRecipe,
        List<ReviewDTO> reviews,
        Double avgRating,
        Long   reviewCount
) {}
