package com.dishly.app.repositories;

import com.dishly.app.models.CollectionModel;
import com.dishly.app.models.MealPrepModel;
import com.dishly.app.models.RecipeModel;
import com.dishly.app.models.UserModel;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CollectionRepository extends JpaRepository<CollectionModel, Long> {
    List<CollectionModel> findByUser(UserModel user);
    Optional<CollectionModel> findByIdAndUser(Long id, UserModel user);

    @Query("""
            SELECT r
            FROM CollectionModel c
            JOIN c.recipes r
            WHERE c.id = :collectionId AND c.user.id = :userId
            ORDER BY r.id DESC
            """)
    List<RecipeModel> findRecipesByCollectionAndUserOrderByIdDesc(@Param("collectionId") Long collectionId,
                                                                   @Param("userId") Long userId,
                                                                   Pageable pageable);

    @Query("""
            SELECT r
            FROM CollectionModel c
            JOIN c.recipes r
            WHERE c.id = :collectionId AND c.user.id = :userId AND r.id < :cursorId
            ORDER BY r.id DESC
            """)
    List<RecipeModel> findRecipesByCollectionAndUserAndCursorOrderByIdDesc(@Param("collectionId") Long collectionId,
                                                                            @Param("userId") Long userId,
                                                                            @Param("cursorId") Long cursorId,
                                                                            Pageable pageable);

    @Query("""
            SELECT mp
            FROM CollectionModel c
            JOIN c.mealPreps mp
            WHERE c.id = :collectionId AND c.user.id = :userId
            ORDER BY mp.id DESC
            """)
    List<MealPrepModel> findMealPrepsByCollectionAndUserOrderByIdDesc(@Param("collectionId") Long collectionId,
                                                                       @Param("userId") Long userId,
                                                                       Pageable pageable);

    @Query("""
            SELECT mp
            FROM CollectionModel c
            JOIN c.mealPreps mp
            WHERE c.id = :collectionId AND c.user.id = :userId AND mp.id < :cursorId
            ORDER BY mp.id DESC
            """)
    List<MealPrepModel> findMealPrepsByCollectionAndUserAndCursorOrderByIdDesc(@Param("collectionId") Long collectionId,
                                                                                @Param("userId") Long userId,
                                                                                @Param("cursorId") Long cursorId,
                                                                                Pageable pageable);
}
