package com.dishly.app.services;

import com.dishly.app.models.IngredientModel;
import com.dishly.app.repositories.IngredientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class IngredientService {

    @Autowired
    private IngredientRepository repository;

    public List<IngredientModel> getAll() {
        return repository.findAll();
    }

    public Optional<IngredientModel> getById(Long id) {
        return repository.findById(id);
    }

    public List<IngredientModel> searchByName(String term) {
        return repository.findByNameContainingIgnoreCase(term);
    }

    public IngredientModel save(IngredientModel ingredient) {
        return repository.save(ingredient);
    }

    public void deleteById(Long id) {
        repository.deleteById(id);
    }
}