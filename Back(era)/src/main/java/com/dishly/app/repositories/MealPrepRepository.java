package com.dishly.app.repositories;

import com.dishly.app.models.MealPrepModel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MealPrepRepository extends JpaRepository<MealPrepModel, Long> {
    List<MealPrepModel> findByUserId(Long userId);
    List<MealPrepModel> findByPublicMealPrepTrue();
    List<MealPrepModel> findByUserIdAndPublicMealPrepTrue(Long userId);
    Page<MealPrepModel> findByPublicMealPrepTrue(Pageable pageable);
    Page<MealPrepModel> findByUserId(Long userId, Pageable pageable);

    List<MealPrepModel> findByPublicMealPrepTrueOrderByIdDesc(Pageable pageable);

    List<MealPrepModel> findByPublicMealPrepTrueAndIdLessThanOrderByIdDesc(Long cursorId, Pageable pageable);

    List<MealPrepModel> findByUserIdAndPublicMealPrepTrueOrderByIdDesc(Long userId, Pageable pageable);

    List<MealPrepModel> findByUserIdAndPublicMealPrepTrueAndIdLessThanOrderByIdDesc(Long userId, Long cursorId, Pageable pageable);
}
