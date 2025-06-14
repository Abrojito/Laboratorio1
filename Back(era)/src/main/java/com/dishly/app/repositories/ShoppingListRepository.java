package com.dishly.app.repositories;

import com.dishly.app.models.ShoppingListModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ShoppingListRepository extends JpaRepository<ShoppingListModel, Long> {

    List<ShoppingListModel> findByUserId(Long userId);

    List<ShoppingListModel> findByUserIdAndCompletedAtIsNull(Long userId);

    List<ShoppingListModel> findByUserIdAndCompletedAtIsNotNull(Long userId);
}
