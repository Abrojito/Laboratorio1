package com.dishly.app.repositories;

import com.dishly.app.models.CollectionModel;
import com.dishly.app.models.UserModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CollectionRepository extends JpaRepository<CollectionModel, Long> {
    List<CollectionModel> findByUser(UserModel user);
    Optional<CollectionModel> findByIdAndUser(Long id, UserModel user);
}
