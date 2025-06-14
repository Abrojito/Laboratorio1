package com.dishly.app.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@Table(name = "shopping_lists")
public class ShoppingListModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private ZonedDateTime createdAt = ZonedDateTime.now();

    private ZonedDateTime completedAt;

    private Long userId; // owner

    @ElementCollection
    @CollectionTable(name = "shopping_list_recipes", joinColumns = @JoinColumn(name = "shopping_list_id"))
    @Column(name = "recipe_id")
    private List<Long> recipeIds = new ArrayList<>();

    @OneToMany(mappedBy = "shoppingList", cascade = CascadeType.ALL)
    private List<ShoppingListItemModel> items = new ArrayList<>();
}

