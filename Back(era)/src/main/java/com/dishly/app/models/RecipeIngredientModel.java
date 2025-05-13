package com.dishly.app.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "recipe_ingredients")
@Getter
@Setter
public class RecipeIngredientModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private RecipeModel recipe;

    @ManyToOne
    private IngredientModel ingredient;

    private String quantity;

}
