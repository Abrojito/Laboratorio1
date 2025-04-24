package com.dishly.app.repositories;

import com.dishly.app.models.IngredientModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IngredientRepository extends JpaRepository<IngredientModel, Long> {
    IngredientModel findByNameContainingIgnoreCase(String name);
    boolean existsByNameContainingIgnoreCase(String name);
}
