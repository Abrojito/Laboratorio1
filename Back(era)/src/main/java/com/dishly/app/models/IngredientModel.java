package com.dishly.app.models;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
public class IngredientModel {
    @Id
    @GeneratedValue
    private Long id;
    private String name;
}
