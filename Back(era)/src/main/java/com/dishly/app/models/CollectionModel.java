package com.dishly.app.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity
@Getter
@Setter
@Table(name = "collections")
public class CollectionModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private UserModel user;

    @ManyToMany
    @JoinTable(
            name = "collection_recipes",
            joinColumns = @JoinColumn(name = "collection_id"),
            inverseJoinColumns = @JoinColumn(name = "recipe_id")
    )
    private Set<RecipeModel> recipes = new HashSet<>();

    @ManyToMany
    @JoinTable(
            name = "collection_mealpreps",
            joinColumns = @JoinColumn(name = "collection_id"),
            inverseJoinColumns = @JoinColumn(name = "mealprep_id")
    )
    private Set<MealPrepModel> mealPreps = new HashSet<>();
}
