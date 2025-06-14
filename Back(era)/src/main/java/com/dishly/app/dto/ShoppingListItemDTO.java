package com.dishly.app.dto;

public record ShoppingListItemDTO(
        Long id,
        String ingredientName,
        String quantity,
        boolean checked,
        String sourceRecipeName
) {}
