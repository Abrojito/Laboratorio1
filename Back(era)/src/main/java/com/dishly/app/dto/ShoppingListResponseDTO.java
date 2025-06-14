package com.dishly.app.dto;

import java.time.ZonedDateTime;
import java.util.List;

public record ShoppingListResponseDTO(
        Long id,
        String name,
        ZonedDateTime createdAt,
        ZonedDateTime completedAt,
        List<ShoppingListItemDTO> items
) {}
