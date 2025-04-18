package com.dishly.app.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "recipes")
public class RecipeModel {
    @Id
    @GeneratedValue
    private Long id;
    private String name;
    private String description;
    @Lob private String image;
    private String category;
    private String author;
    private Long userId;
    private String difficulty;


    @ManyToMany
    @JoinTable(
            name = "recipe_ingredients",
            joinColumns = @JoinColumn(name = "recipe_id"),
            inverseJoinColumns = @JoinColumn(name = "ingredient_id")
    )
    private List<IngredientModel> ingredients;
}
