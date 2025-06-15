package com.dishly.app.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CollectionRequestDTO {
    private String name;
    private List<Long> recipeIds;
    private List<Long> mealPrepIds;
}
