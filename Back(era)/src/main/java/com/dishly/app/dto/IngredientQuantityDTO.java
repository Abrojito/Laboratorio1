package com.dishly.app.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class IngredientQuantityDTO {
    private Long ingredientId;
    private String quantity;

    public IngredientQuantityDTO(Long ingredientId,  String quantity) {
        this.ingredientId = ingredientId;
        this.quantity = quantity;
    }
}
