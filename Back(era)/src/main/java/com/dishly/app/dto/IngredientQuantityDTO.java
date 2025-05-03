package com.dishly.app.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class IngredientQuantityDTO {
    private Long ingredientId;
    private String ingredientName;
    private String quantity;

    public IngredientQuantityDTO(Long ingredientId, String ingredientName, String quantity) {
        this.ingredientId = ingredientId;
        this.ingredientName = ingredientName;
        this.quantity = quantity;
    }
}
