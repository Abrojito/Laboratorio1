package com.dishly.app.services;

import com.dishly.app.dto.RecipeRequestDTO;
import com.dishly.app.dto.RecipeResponseDTO;
import com.dishly.app.models.IngredientModel;
import com.dishly.app.models.RecipeModel;
import com.dishly.app.repositories.IngredientRepository;
import com.dishly.app.repositories.RecipeRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RecipeService {

    private final RecipeRepository recipeRepo;
    private final IngredientRepository ingRepo;

    public RecipeService(RecipeRepository recipeRepo,
                         IngredientRepository ingRepo) {
        this.recipeRepo = recipeRepo;
        this.ingRepo = ingRepo;
    }

    /* ---------- Lectura ---------- */

    @Transactional(readOnly = true)
    public RecipeResponseDTO getById(Long id) {
        return toDTO(recipeRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Receta no encontrada: " + id)));
    }

    @Transactional(readOnly = true)
    public List<RecipeResponseDTO> getAll() {
        return recipeRepo.findAll().stream()
                .map(this::toDTO)
                .toList();
    }

    /* ---------- Creación ---------- */

    @Transactional
    public RecipeResponseDTO create(RecipeRequestDTO dto) {
        if (recipeRepo.existsByName(dto.name()))
            throw new IllegalArgumentException("Ya existe una receta con ese nombre");

        RecipeModel model = new RecipeModel();
        updateModel(model, dto);
        return toDTO(recipeRepo.save(model));
    }

    /* ---------- Actualización ---------- */

    @Transactional
    public RecipeResponseDTO update(Long id, RecipeRequestDTO dto) {
        RecipeModel model = recipeRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Receta no encontrada: " + id));
        updateModel(model, dto);
        return toDTO(recipeRepo.save(model));
    }

    /* ---------- Borrado ---------- */

    @Transactional
    public void delete(Long id) {
        recipeRepo.deleteById(id);
    }

    /* ---------- Helpers ---------- */

    private void updateModel(RecipeModel m, RecipeRequestDTO dto) {
        m.setName(dto.name());
        m.setDescription(dto.description());
        m.setImage(dto.image());
        m.setCategory(dto.category());
        m.setAuthor(dto.author());
        m.setUserId(dto.userId());
        m.setDifficulty(dto.difficulty());

        if (dto.ingredientIds() != null) {
            List<IngredientModel> ings = dto.ingredientIds().stream()
                    .map(i -> ingRepo.findById(i)
                            .orElseThrow(() -> new EntityNotFoundException("Ingrediente " + i)))
                    .toList();
            m.setIngredients(ings);
        }
    }

    private RecipeResponseDTO toDTO(RecipeModel m) {
        return new RecipeResponseDTO(
                m.getId(),
                m.getName(),
                m.getDescription(),
                m.getImage(),
                m.getCategory(),
                m.getAuthor(),
                m.getUserId(),
                m.getDifficulty()
        );
    }
}
