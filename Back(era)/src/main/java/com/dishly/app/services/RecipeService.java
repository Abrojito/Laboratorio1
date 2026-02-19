package com.dishly.app.services;

import com.dishly.app.dto.IngredientQuantityDTO;
import com.dishly.app.dto.PagedResponse;
import com.dishly.app.dto.RecipeRequestDTO;
import com.dishly.app.dto.RecipeResponseDTO;
import com.dishly.app.dto.ReviewDTO;
import com.dishly.app.models.*;
import com.dishly.app.projection.RatingSummary;
import com.dishly.app.repositories.IngredientRepository;
import com.dishly.app.repositories.RecipeRepository;
import com.dishly.app.repositories.ReviewRepository;
import com.dishly.app.repositories.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.AccessDeniedException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class RecipeService {

    private final RecipeRepository recipeRepo;
    private final IngredientRepository ingRepo;
    private final UserRepository userRepo;
    private final ReviewRepository reviewRepo;

    public RecipeService(RecipeRepository recipeRepo,
                         IngredientRepository ingRepo, UserRepository userRepo, ReviewRepository reviewRepo) {
        this.recipeRepo = recipeRepo;
        this.ingRepo = ingRepo;
        this.userRepo = userRepo;
        this.reviewRepo = reviewRepo;
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
    public RecipeResponseDTO create(RecipeRequestDTO dto, String email) {
        if (recipeRepo.existsByName(dto.name()))
            throw new IllegalArgumentException("Ya existe una receta con ese nombre");

        UserModel user = userRepo.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

        RecipeModel model = new RecipeModel();
        updateModel(model, dto, user.getId());
        return toDTO(recipeRepo.save(model));
    }

    /* ---------- Actualización ---------- */

    @Transactional
    public RecipeResponseDTO update(Long id, RecipeRequestDTO dto, String email) throws AccessDeniedException {
        RecipeModel recipe = recipeRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Receta no encontrada: " + id));

        UserModel user = userRepo.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

        if (!recipe.getUserId().equals(user.getId())) {
            throw new AccessDeniedException("No podés editar una receta que no es tuya");
        }

        updateModel(recipe, dto, user.getId());
        return toDTO(recipeRepo.save(recipe));
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
            throw new IllegalArgumentException("Ya existe una receta con ese nombre");
        }
        RecipeModel model = new RecipeModel();
        // copiamos datos
        updateModel(model, dto, userId);
        model.setUserId(userId);
        model.setSteps(dto.steps());
        model.setAuthor(userRepo.findById(userId).orElseThrow().getUsername());
        return toDTO(recipeRepo.save(model));
    }


    /* ---------- Búsqueda de recetas públicas ---------- */

    @Transactional(readOnly = true)
    public List<RecipeResponseDTO> search(String name, String ingredient, String author) {
        return recipeRepo.findAll().stream()
                .filter(r -> name == null || r.getName().toLowerCase().contains(name.toLowerCase()))
                .filter(r -> author == null || Optional.ofNullable(r.getAuthor())
                        .map(a -> a.toLowerCase().contains(author.toLowerCase()))
                        .orElse(false))

                .filter(r -> ingredient == null || r.getIngredients().stream()
                        .anyMatch(i -> i.getIngredient().getName().toLowerCase().contains(ingredient.toLowerCase())))
                .map(this::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public PagedResponse<RecipeResponseDTO> searchByCursor(String name, String ingredient, String author, String cursor, int limit) {
        int safeLimit = limit > 0 ? limit : 10;
        Long cursorId = (cursor == null || cursor.isBlank()) ? null : Long.parseLong(cursor);

        List<RecipeModel> filtered = recipeRepo.findAll().stream()
                .filter(RecipeModel::isPublicRecipe)
                .filter(r -> cursorId == null || r.getId() < cursorId)
                .filter(r -> name == null || r.getName().toLowerCase().contains(name.toLowerCase()))
                .filter(r -> author == null || Optional.ofNullable(r.getAuthor())
                        .map(a -> a.toLowerCase().contains(author.toLowerCase()))
                        .orElse(false))
                .filter(r -> ingredient == null || r.getIngredients().stream()
                        .anyMatch(i -> i.getIngredient().getName().toLowerCase().contains(ingredient.toLowerCase())))
                .sorted(Comparator.comparing(RecipeModel::getId).reversed())
                .limit((long) safeLimit + 1)
                .toList();

        boolean hasNext = filtered.size() > safeLimit;
        List<RecipeModel> pageModels = hasNext ? filtered.subList(0, safeLimit) : filtered;

        List<RecipeResponseDTO> items = pageModels.stream()
                .map(this::toDTO)
                .toList();

        String nextCursor = hasNext && !items.isEmpty()
                ? String.valueOf(items.get(items.size() - 1).id())
                : null;

        return new PagedResponse<>(items, nextCursor, hasNext);
    }


    /* ---------- Helpers ---------- */

    private void updateModel(RecipeModel m, RecipeRequestDTO dto, Long userId) {
        m.setName(dto.name());
        m.setDescription(dto.description());
        m.setImage(dto.image());
        m.setCategory(dto.category());
        m.setAuthor(dto.author());
        m.setUserId(userId);
        m.setTime(dto.time());

        if (dto.steps() != null) {
            m.setSteps(new ArrayList<>(dto.steps()));
        }


        if (dto.publicRecipe() != null) {
            m.setPublicRecipe(dto.publicRecipe());
        }

        if (dto.ingredients() != null) {
            // Vaciar la colección actual (Hibernate la sigue reconociendo)
            m.getIngredients().clear();

            // Agregar los nuevos elementos
            for (Map.Entry<Long, String> entry : dto.ingredients().entrySet()) {
                Long ingredientId = entry.getKey();
                String quantity = entry.getValue();

                IngredientModel ing = ingRepo.findById(ingredientId)
                        .orElseThrow(() -> new EntityNotFoundException("Ingrediente " + ingredientId));

                RecipeIngredientModel link = new RecipeIngredientModel();
                link.setIngredient(ing);
                link.setQuantity(quantity);
                link.setRecipe(m);

                m.getIngredients().add(link); // ✅ usamos la misma instancia de lista
            }
        }
    }


    public RecipeResponseDTO toDTO(RecipeModel m) {
        List<IngredientQuantityDTO> ingredients = Optional.ofNullable(m.getIngredients())
                .orElse(List.of())
                .stream()
                .map(link -> new IngredientQuantityDTO(
                        link.getIngredient().getId(),
                        link.getIngredient().getName(),   // ✅ agregar el nombre acá
                        link.getQuantity()
                ))
                .toList();

        UserModel user = userRepo.findById(m.getUserId())
                .orElseThrow();

        List<ReviewModel> reviewModels = reviewRepo.findByRecipe(m);

        List<ReviewDTO> reviewDTOs = reviewModels.stream()
                .map(r -> new ReviewDTO(
                        r.getId(),
                        r.getComment(),
                        r.getRating(),
                        r.getUser().getUsername(),
                        r.getUser().getId(),
                        r.getUser().getPhoto(),
                        r.getCreatedAt().toString()
                ))
                .toList();

        RatingSummary summary = reviewRepo.getSummaryByRecipeId(m.getId());
        Double averageRating = (summary == null || summary.getAvgRating() == null) ? 0d : summary.getAvgRating();
        int ratingCount = (summary == null || summary.getReviewCount() == null)
                ? 0
                : Math.toIntExact(summary.getReviewCount());


        return new RecipeResponseDTO(
                m.getId(),
                m.getName(),
                m.getDescription(),
                m.getImage(),           // imagen de la receta
                m.getCategory(),
                user.getUsername(),     // nombre del autor
                user.getPhoto(),        // imagen del autor
                m.getUserId(),
                m.getTime(),
                ingredients,
                m.getSteps(),
                m.isPublicRecipe(),
                reviewDTOs,
                averageRating,
                ratingCount
        );
    }

    @Transactional(readOnly = true)
    public List<RecipeResponseDTO> getAllByUser(Long userId) {
        return recipeRepo.findByUserId(userId)
                .stream().map(this::toDTO).toList();
    }

    @Transactional(readOnly = true)
    public Page<RecipeResponseDTO> getAllByUser(Long userId, Pageable pageable) {
        return recipeRepo.findByUserId(userId, pageable)
                .map(this::toDTO);
    }

    @Transactional(readOnly = true)
    public List<RecipeResponseDTO> getPublic() {
        return recipeRepo.findByPublicRecipeTrue()
                .stream().map(this::toDTO).toList();
    }


    @Transactional(readOnly = true)
    public Page<RecipeResponseDTO> getPublic(Pageable pageable) {
        return recipeRepo.findByPublicRecipeTrue(pageable)   // repo paginado
                .map(this::toDTO);                  // convierte cada entidad
    }

    @Transactional(readOnly = true)
    public PagedResponse<RecipeResponseDTO> getPublicByCursor(String cursor, int limit) {
        int safeLimit = limit > 0 ? limit : 10;
        Pageable pageable = PageRequest.of(0, safeLimit + 1);

        List<RecipeModel> recipeModels;
        if (cursor == null || cursor.isBlank()) {
            recipeModels = recipeRepo.findByPublicRecipeTrueOrderByIdDesc(pageable);
        } else {
            Long cursorId = Long.parseLong(cursor);
            recipeModels = recipeRepo.findByPublicRecipeTrueAndIdLessThanOrderByIdDesc(cursorId, pageable);
        }

        boolean hasNext = recipeModels.size() > safeLimit;

        List<RecipeModel> pageModels = hasNext
                ? recipeModels.subList(0, safeLimit)
                : recipeModels;

        List<RecipeResponseDTO> items = pageModels.stream()
                .map(this::toDTO)
                .toList();

        String nextCursor = hasNext && !items.isEmpty()
                ? String.valueOf(items.get(items.size() - 1).id())
                : null;

        return new PagedResponse<>(items, nextCursor, hasNext);
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
