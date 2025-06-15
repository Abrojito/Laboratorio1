package com.dishly.app.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "favorite_mealpreps")
@Getter
@Setter
public class FavoriteMealPrepModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne private UserModel user;
    @ManyToOne private MealPrepModel mealPrep;
}

