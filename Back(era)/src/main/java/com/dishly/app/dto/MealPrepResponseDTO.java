package com.dishly.app.dto;

import java.util.List;


public record MealPrepResponseDTO(
        Long id,
        String name,
        String description,
        String image,
        String author,
        String authorPhoto,
        Long userId,
        Boolean publicMealPrep,
        List<RecipeSummaryDTO> recipes,
        List<MealPrepReviewDTO> reviews,
        Double averageRating,
        int    ratingCount,
        boolean hasUndesiredIngredients
) {}
