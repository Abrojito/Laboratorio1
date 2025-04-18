package com.dishly.app.dto;

public record RecipeResponseDTO(
        Long   id,
        String name,
        String description,
        String image,
        String category,
        String author,
        Long   userId,
        String difficulty
) {}
