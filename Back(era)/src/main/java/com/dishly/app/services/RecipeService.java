package com.dishly.app.services;

import com.dishly.app.dto.IngredientQuantityDTO;
import com.dishly.app.dto.RecipeRequestDTO;
import com.dishly.app.dto.RecipeResponseDTO;
import com.dishly.app.models.IngredientModel;
import com.dishly.app.models.RecipeIngredientModel;
import com.dishly.app.models.RecipeModel;
import com.dishly.app.models.UserModel;
import com.dishly.app.repositories.IngredientRepository;
import com.dishly.app.repositories.RecipeRepository;
import com.dishly.app.repositories.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.AccessDeniedException;
import java.util.List;
import java.util.Optional;

@Service
public class RecipeService {

    private final RecipeRepository recipeRepo;
    private final IngredientRepository ingRepo;
    private final UserRepository userRepo;

    public RecipeService(RecipeRepository recipeRepo,
                         IngredientRepository ingRepo, UserRepository userRepo) {
        this.recipeRepo = recipeRepo;
        this.ingRepo = ingRepo;
        this.userRepo = userRepo;
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

    /* ---------- Creación para un usuario concreto ---------- */
    @Transactional
    public RecipeResponseDTO createForUser(RecipeRequestDTO dto, Long userId) {

        // Reaprovechamos la validación de nombre único
        if (recipeRepo.existsByName(dto.name())) {
            System.out.println("soy gay");
            throw new IllegalArgumentException("Ya existe una receta con ese nombre");
        }
        RecipeModel model = new RecipeModel();
        System.out.println("soy menos gay");
        // copiamos datos
        updateModel(model, dto);
        model.setUserId(userId);           // ← vincular al dueño
        model.setSteps(dto.steps());
        System.out.println("soy menos");
        return toDTO(recipeRepo.save(model));
    }

    /* ---------- Helpers ---------- */

    private void updateModel(RecipeModel m, RecipeRequestDTO dto) {
        m.setName(dto.name());
        m.setDescription(dto.description());
        m.setImage(dto.image());
        m.setCategory(dto.category());
        m.setAuthor(dto.author());
        m.setUserId(dto.userId());
        m.setTime(dto.time());

        if (dto.steps() != null) {
            m.getSteps().clear();
            m.getSteps().addAll(dto.steps());
        }

        if (dto.publicRecipe() != null) {
            m.setPublicRecipe(dto.publicRecipe());
        }

        if (dto.ingredients() != null) {
            List<RecipeIngredientModel> links = dto.ingredients().entrySet().stream().map(entry -> {
                Long ingredientId = entry.getKey();
                String quantity = entry.getValue();

                IngredientModel ing = ingRepo.findById(ingredientId)
                        .orElseThrow(() -> new EntityNotFoundException("Ingrediente " + ingredientId));

                RecipeIngredientModel link = new RecipeIngredientModel();
                link.setIngredient(ing);
                link.setQuantity(quantity);
                link.setRecipe(m);

                return link;
            }).toList();

            m.setIngredients(links);
        }
    }


    private RecipeResponseDTO toDTO(RecipeModel m) {
        List<IngredientQuantityDTO> ingredients = Optional.ofNullable(m.getIngredients())
    .orElse(List.of())
    .stream()
    .map(link -> new IngredientQuantityDTO(
            link.getIngredient().getId(),
            link.getQuantity()
    ))
    .toList();

        return new RecipeResponseDTO(
                m.getId(),
                m.getName(),
                m.getDescription(),
                m.getImage(),
                m.getCategory(),
                m.getAuthor(),
                m.getUserId(),
                m.getTime(),
                ingredients,
                m.getSteps(),
                m.isPublicRecipe()
        );
    }

    @Transactional(readOnly = true)
    public List<RecipeResponseDTO> getAllByUser(Long userId) {
        return recipeRepo.findByUserId(userId)
                .stream().map(this::toDTO).toList();
    }

    @Transactional(readOnly = true)
    public List<RecipeResponseDTO> getPublic() {
        return recipeRepo.findByPublicRecipeTrue()
                .stream().map(this::toDTO).toList();
    }

    @Transactional
    public void deleteRecipe(Long recipeId, String email) throws AccessDeniedException {
        RecipeModel recipe = recipeRepo.findById(recipeId)
                .orElseThrow(() -> new EntityNotFoundException("Recipe not found"));

        UserModel user = userRepo.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        if (!recipe.getUserId().equals(user.getId())) {
            throw new AccessDeniedException("You cannot delete someone else's recipe");
        }

        recipeRepo.delete(recipe);
    }
}
