package com.dishly.app.repositories;

import com.dishly.app.models.MealPrepModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MealPrepRepository extends JpaRepository<MealPrepModel, Long> {
    List<MealPrepModel> findByUserId(Long userId);
    List<MealPrepModel> findByPublicMealPrepTrue();
    List<MealPrepModel> findByUserIdAndPublicMealPrepTrue(Long userId);
}
