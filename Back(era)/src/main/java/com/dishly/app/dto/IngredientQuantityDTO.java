package com.dishly.app.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class IngredientQuantityDTO {
    private Long ingredientId;
    private String name;
    private String quantity;

    public IngredientQuantityDTO(Long ingredientId, String name, String quantity) {
        this.ingredientId = ingredientId;
        this.name = name;
        this.quantity = quantity;
    }
}
