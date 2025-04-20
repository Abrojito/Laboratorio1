package com.dishly.app.services;

import com.dishly.app.dto.IngredientDTO;
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
        return null;
    }

    public IngredientModel save(IngredientModel ingredient) {
        return repository.save(ingredient);
    }
    public IngredientDTO validate(IngredientDTO ingredient) {
        if (ingredient.name() == null) {
            throw new IllegalArgumentException("El nombre del ingrediente no puede estar vacío");
        }
        IngredientModel result = repository.findByNameContainingIgnoreCase(ingredient.name());
        if (result != null) {
            return new IngredientDTO(result.getId(), result.getName());
        } else {
            IngredientModel newIngredient = new IngredientModel();
            newIngredient.setName(ingredient.name());
            repository.save(newIngredient);
            return new IngredientDTO(newIngredient.getId(), newIngredient.getName());
        }
    }
}