package com.dishly.app.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
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
    private String time;

    @Column(columnDefinition = "boolean default true")
    private boolean publicRecipe = true;

    @OneToMany(mappedBy = "recipe", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RecipeIngredientModel> ingredients = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "recipe_steps", joinColumns = @JoinColumn(name = "recipe_id"))
    @Column(name = "step")
    private List<String> steps = new ArrayList<>();


}
