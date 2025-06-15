package com.dishly.app.repositories;

import com.dishly.app.models.FavoriteMealPrepModel;
import com.dishly.app.models.MealPrepModel;
import com.dishly.app.models.UserModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FavoriteMealPrepRepository extends JpaRepository<FavoriteMealPrepModel, Long> {
    boolean existsByUserAndMealPrep(UserModel user, MealPrepModel mealPrep);
    void deleteByUserAndMealPrep(UserModel user, MealPrepModel mealPrep);
    List<FavoriteMealPrepModel> findByUser(UserModel user);
}

