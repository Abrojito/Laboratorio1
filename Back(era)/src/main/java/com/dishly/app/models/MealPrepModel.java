package com.dishly.app.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@Table(name = "meal_preps")
public class MealPrepModel {

    @Id
    @GeneratedValue
    private Long id;

    private String name;
    private String description;

    @Column(columnDefinition = "TEXT")
    private String image;

    @Column(columnDefinition = "boolean default true")
    private boolean publicMealPrep = true;

    private String author;
    private Long userId;

    @ManyToMany
    @JoinTable(
            name = "meal_prep_recipes",
            joinColumns = @JoinColumn(name = "meal_prep_id"),
            inverseJoinColumns = @JoinColumn(name = "recipe_id")
    )
    private List<RecipeModel> recipes = new ArrayList<>();

    @OneToMany(mappedBy = "mealPrep", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MealPrepReviewModel> reviews = new ArrayList<>();
}
