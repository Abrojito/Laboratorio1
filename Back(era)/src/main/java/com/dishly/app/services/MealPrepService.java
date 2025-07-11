package com.dishly.app.services;

import com.dishly.app.dto.*;
import com.dishly.app.models.*;
import com.dishly.app.projection.RatingSummary;
import com.dishly.app.repositories.MealPrepRepository;
import com.dishly.app.repositories.MealPrepReviewRepository;
import com.dishly.app.repositories.RecipeRepository;
import com.dishly.app.repositories.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.AccessDeniedException;
import java.util.List;

@Service
public class MealPrepService {

    private final MealPrepRepository mealPrepRepo;
    private final MealPrepReviewRepository reviewRepo;
    private final RecipeRepository recipeRepo;
    private final UserRepository userRepo;

    public MealPrepService(MealPrepRepository mealPrepRepo, MealPrepReviewRepository reviewRepo,
                           RecipeRepository recipeRepo, UserRepository userRepo) {
        this.mealPrepRepo = mealPrepRepo;
        this.reviewRepo = reviewRepo;
        this.recipeRepo = recipeRepo;
        this.userRepo = userRepo;
    }

    @Transactional(readOnly = true)
    public List<MealPrepResponseDTO> getPublic() {
        return mealPrepRepo.findByPublicMealPrepTrue().stream()
                .map(this::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<MealPrepResponseDTO> getPublic(Pageable pageable) {
        return mealPrepRepo.findByPublicMealPrepTrue(pageable)
                .map(this::toDTO);
    }

    @Transactional(readOnly = true)
    public MealPrepResponseDTO getById(Long id) {
        MealPrepModel mealPrepModel = mealPrepRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("MealPrep no encontrado"));

        return toDTO(mealPrepModel);
    }




    @Transactional(readOnly = true)
    public List<MealPrepResponseDTO> getMealPrepsByUser(Long userId) {
        return mealPrepRepo.findByUserId(userId).stream()
                .map(this::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<MealPrepResponseDTO> getMealPrepsByUser(Long userId, Pageable pageable) {
        return mealPrepRepo.findByUserId(userId, pageable).map(this::toDTO);
    }


    @Transactional
    public MealPrepResponseDTO create(MealPrepRequestDTO dto, String email) {
        UserModel user = userRepo.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

        MealPrepModel m = new MealPrepModel();
        updateModel(m, dto, user);
        return toDTO(mealPrepRepo.save(m));
    }

    @Transactional
    public MealPrepResponseDTO update(Long id, MealPrepRequestDTO dto, String email) throws AccessDeniedException {
        MealPrepModel m = mealPrepRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("MealPrep no encontrado"));

        UserModel user = userRepo.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

        if (!m.getUserId().equals(user.getId())) {
            throw new AccessDeniedException("No podés editar un meal prep que no es tuyo");
        }

        updateModel(m, dto, user);
        return toDTO(mealPrepRepo.save(m));
    }

    @Transactional
    public void delete(Long id, String email) throws AccessDeniedException {
        MealPrepModel m = mealPrepRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("MealPrep no encontrado"));

        UserModel user = userRepo.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

        if (!m.getUserId().equals(user.getId())) {
            throw new AccessDeniedException("No podés borrar un meal prep que no es tuyo");
        }

        mealPrepRepo.delete(m);
    }

    @Transactional(readOnly = true)
    public List<MealPrepResponseDTO> getAllByUser(Long userId) {
        return mealPrepRepo.findByUserId(userId).stream()
                .map(this::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MealPrepResponseDTO> search(String name, String ingredient, String author) {
        return mealPrepRepo.findAll().stream()
                .filter(mp -> name == null || mp.getName().toLowerCase().contains(name.toLowerCase()))
                .filter(mp -> author == null || mp.getAuthor().toLowerCase().contains(author.toLowerCase()))
                .filter(mp -> ingredient == null || mp.getRecipes().stream()
                        .flatMap(r -> r.getIngredients().stream())
                        .anyMatch(i -> i.getIngredient().getName().toLowerCase().contains(ingredient.toLowerCase())))
                .map(this::toDTO)
                .toList();
    }


    private void updateModel(MealPrepModel m, MealPrepRequestDTO dto, UserModel user) {
        m.setName(dto.name());
        m.setDescription(dto.description());
        m.setImage(dto.image());
        m.setPublicMealPrep(dto.publicMealPrep() != null ? dto.publicMealPrep() : true);
        m.setAuthor(user.getUsername());
        m.setUserId(user.getId());

        m.getRecipes().clear();

        if (dto.recipeIds() != null) {
            List<RecipeModel> recipes = dto.recipeIds().stream()
                    .map(id -> recipeRepo.findById(id)
                            .orElseThrow(() -> new EntityNotFoundException("Receta " + id + " no encontrada")))
                    .toList();
            m.getRecipes().addAll(recipes);
        }
    }

    MealPrepResponseDTO toDTO(MealPrepModel m) {
        List<RecipeSummaryDTO> recipeDTOs = m.getRecipes().stream()
                .map(r -> new RecipeSummaryDTO(r.getId(), r.getName(), r.getImage()))
                .toList();

        UserModel user = userRepo.findById(m.getUserId())
                .orElseThrow();

        List<MealPrepReviewModel> reviewModels = reviewRepo.findByMealPrep(m);

        List<MealPrepReviewDTO> reviewDTOs = reviewModels.stream()
                .map(r -> {
                    MealPrepReviewDTO dto = new MealPrepReviewDTO();
                    dto.setId(r.getId());
                    dto.setComment(r.getComment());
                    dto.setRating(r.getRating());
                    dto.setUsername(r.getUser().getUsername());
                    dto.setUserPhoto(r.getUser().getPhoto());
                    dto.setCreatedAt(r.getCreatedAt());
                    return dto;
                })
                .toList();

        RatingSummary summary = reviewRepo.getSummaryByMealPrepId(m.getId());
        Double avgRating = summary.getAvgRating()  != null ? summary.getAvgRating()  : 0d;
        Long   reviewCnt = summary.getReviewCount() != null ? summary.getReviewCount() : 0L;


        return new MealPrepResponseDTO(
                m.getId(),
                m.getName(),
                m.getDescription(),
                m.getImage(),
                user.getUsername(),
                user.getPhoto(),
                m.getUserId(),
                m.isPublicMealPrep(),
                recipeDTOs,
                reviewDTOs,
                avgRating,
                reviewCnt
        );
    }

}
