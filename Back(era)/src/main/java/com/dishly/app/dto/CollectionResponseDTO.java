package com.dishly.app.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class CollectionResponseDTO {
    private Long id;
    private String name;
    private List<RecipeSummaryDTO> recipes;
    private List<MealPrepSummaryDTO> mealPreps;
}
