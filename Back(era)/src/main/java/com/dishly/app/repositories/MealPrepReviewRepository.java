package com.dishly.app.repositories;

import com.dishly.app.models.MealPrepModel;
import com.dishly.app.models.MealPrepReviewModel;
import com.dishly.app.projection.RatingSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MealPrepReviewRepository extends JpaRepository<MealPrepReviewModel, Long> {
    List<MealPrepReviewModel> findByMealPrep(MealPrepModel mealPrep);

    @Query("""
       SELECT AVG(r.rating) AS avgRating,
              COUNT(r)      AS reviewCount
       FROM   MealPrepReviewModel r
       WHERE  r.mealPrep.id = :mpId
       """)
    RatingSummary getSummaryByMealPrepId(@Param("mpId") Long mpId);
}
