package com.dishly.app.repositories;

import com.dishly.app.models.MealPrepModel;
import com.dishly.app.models.MealPrepReviewModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MealPrepReviewRepository extends JpaRepository<MealPrepReviewModel, Long> {
    List<MealPrepReviewModel> findByMealPrep(MealPrepModel mealPrep);
}
