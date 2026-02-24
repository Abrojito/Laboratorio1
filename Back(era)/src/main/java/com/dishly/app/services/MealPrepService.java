package com.dishly.app.services;

import com.dishly.app.dto.*;
import com.dishly.app.models.*;
import com.dishly.app.projection.RatingSummary;
import com.dishly.app.repositories.MealPrepRepository;
import com.dishly.app.repositories.MealPrepReviewRepository;
import com.dishly.app.repositories.RecipeRepository;
import com.dishly.app.repositories.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.AccessDeniedException;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class MealPrepService {
    private static final Logger log = LoggerFactory.getLogger(MealPrepService.class);

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
        return getPublic(pageable, null);
    }

    @Transactional(readOnly = true)
    public Page<MealPrepResponseDTO> getPublic(Pageable pageable, String email) {
        Set<Long> undesiredIngredientIds = getUndesiredIngredientIds(email);
        return mealPrepRepo.findByPublicMealPrepTrue(pageable)
                .map(mp -> toDTO(mp, undesiredIngredientIds));
    }

    @Transactional(readOnly = true)
    public PagedResponse<MealPrepResponseDTO> getPublicByCursor(String cursor, int limit) {
        return getPublicByCursor(cursor, limit, null);
    }

    @Transactional(readOnly = true)
    public PagedResponse<MealPrepResponseDTO> getPublicByCursor(String cursor, int limit, String email) {
        int safeLimit = limit > 0 ? limit : 10;
        Pageable pageable = PageRequest.of(0, safeLimit + 1);
        Set<Long> undesiredIngredientIds = getUndesiredIngredientIds(email);

        List<MealPrepModel> mealPrepModels;
        if (cursor == null || cursor.isBlank()) {
            mealPrepModels = mealPrepRepo.findByPublicMealPrepTrueOrderByIdDesc(pageable);
        } else {
            Long cursorId = Long.parseLong(cursor);
            mealPrepModels = mealPrepRepo.findByPublicMealPrepTrueAndIdLessThanOrderByIdDesc(cursorId, pageable);
        }

        boolean hasNext = mealPrepModels.size() > safeLimit;

        List<MealPrepModel> pageModels = hasNext
                ? mealPrepModels.subList(0, safeLimit)
                : mealPrepModels;

        List<MealPrepResponseDTO> items = pageModels.stream()
                .map(mp -> toDTO(mp, undesiredIngredientIds))
                .toList();
        long flaggedCount = items.stream().filter(MealPrepResponseDTO::hasUndesiredIngredients).count();

        String nextCursor = hasNext && !items.isEmpty()
                ? String.valueOf(items.get(items.size() - 1).id())
                : null;

        log.debug("MealPrep home cursor principal={} undesiredCount={} flaggedItems={}",
                email, undesiredIngredientIds.size(), flaggedCount);

        return new PagedResponse<>(items, nextCursor, hasNext);
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
        return getMealPrepsByUser(userId, pageable, null);
    }

    @Transactional(readOnly = true)
    public Page<MealPrepResponseDTO> getMealPrepsByUser(Long userId, Pageable pageable, String email) {
        Set<Long> undesiredIngredientIds = getUndesiredIngredientIds(email);
        return mealPrepRepo.findByUserId(userId, pageable).map(mp -> toDTO(mp, undesiredIngredientIds));
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
        return getAllByUser(userId, null);
    }

    @Transactional(readOnly = true)
    public List<MealPrepResponseDTO> getAllByUser(Long userId, String email) {
        Set<Long> undesiredIngredientIds = getUndesiredIngredientIds(email);
        return mealPrepRepo.findByUserId(userId).stream()
                .map(mp -> toDTO(mp, undesiredIngredientIds))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MealPrepResponseDTO> search(String name, String ingredient, String author) {
        return search(name, ingredient, author, null);
    }

    @Transactional(readOnly = true)
    public List<MealPrepResponseDTO> search(String name, String ingredient, String author, String email) {
        Set<Long> undesiredIngredientIds = getUndesiredIngredientIds(email);
        return mealPrepRepo.findAll().stream()
                .filter(mp -> name == null || mp.getName().toLowerCase().contains(name.toLowerCase()))
                .filter(mp -> author == null || mp.getAuthor().toLowerCase().contains(author.toLowerCase()))
                .filter(mp -> ingredient == null || mp.getRecipes().stream()
                        .flatMap(r -> r.getIngredients().stream())
                        .anyMatch(i -> i.getIngredient().getName().toLowerCase().contains(ingredient.toLowerCase())))
                .map(mp -> toDTO(mp, undesiredIngredientIds))
                .toList();
    }

    @Transactional(readOnly = true)
    public PagedResponse<MealPrepResponseDTO> searchByCursor(String name, String ingredient, String author, String cursor, int limit) {
        return searchByCursor(name, ingredient, author, cursor, limit, null, false, false);
    }

    @Transactional(readOnly = true)
    public PagedResponse<MealPrepResponseDTO> searchByCursor(String name, String ingredient, String author, String cursor, int limit,
                                                             String email, boolean onlyFollowing, boolean excludeUndesired) {
        int safeLimit = limit > 0 ? limit : 10;
        Long cursorId = (cursor == null || cursor.isBlank()) ? null : Long.parseLong(cursor);
        boolean hasAuthUser = email != null && !email.isBlank();

        Set<Long> followingIdsTmp = Set.of();
        Set<Long> undesiredIngredientIdsTmp = getUndesiredIngredientIds(email);

        if (hasAuthUser && onlyFollowing) {
            UserModel me = userRepo.findByEmail(email).orElse(null);
            if (me != null) {
                followingIdsTmp = me.getFollowing().stream()
                        .map(UserModel::getId)
                        .collect(Collectors.toSet());
            }
        }
        final Set<Long> followingIds = followingIdsTmp;
        final Set<Long> undesiredIngredientIds = undesiredIngredientIdsTmp;

        List<MealPrepModel> filtered = mealPrepRepo.findAll().stream()
                .filter(MealPrepModel::isPublicMealPrep)
                .filter(mp -> cursorId == null || mp.getId() < cursorId)
                .filter(mp -> name == null || mp.getName().toLowerCase().contains(name.toLowerCase()))
                .filter(mp -> author == null || mp.getAuthor().toLowerCase().contains(author.toLowerCase()))
                .filter(mp -> !hasAuthUser || !onlyFollowing || followingIds.contains(mp.getUserId()))
                .filter(mp -> ingredient == null || mp.getRecipes().stream()
                        .flatMap(r -> r.getIngredients().stream())
                        .anyMatch(i -> i.getIngredient().getName().toLowerCase().contains(ingredient.toLowerCase())))
                .filter(mp -> !hasAuthUser || !excludeUndesired || mp.getRecipes().stream()
                        .flatMap(r -> r.getIngredients().stream())
                        .noneMatch(i -> undesiredIngredientIds.contains(i.getIngredient().getId())))
                .sorted(Comparator.comparing(MealPrepModel::getId).reversed())
                .limit((long) safeLimit + 1)
                .toList();

        boolean hasNext = filtered.size() > safeLimit;
        List<MealPrepModel> pageModels = hasNext ? filtered.subList(0, safeLimit) : filtered;

        List<MealPrepResponseDTO> items = pageModels.stream()
                .map(mp -> toDTO(mp, undesiredIngredientIds))
                .toList();
        long flaggedCount = items.stream().filter(MealPrepResponseDTO::hasUndesiredIngredients).count();

        String nextCursor = hasNext && !items.isEmpty()
                ? String.valueOf(items.get(items.size() - 1).id())
                : null;

        log.debug("MealPrep search cursor principal={} undesiredCount={} flaggedItems={}",
                email, undesiredIngredientIds.size(), flaggedCount);

        return new PagedResponse<>(items, nextCursor, hasNext);
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
        return toDTO(m, Set.of());
    }

    MealPrepResponseDTO toDTO(MealPrepModel m, Set<Long> undesiredIngredientIds) {
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
        Double averageRating = (summary == null || summary.getAvgRating() == null) ? 0d : summary.getAvgRating();
        int ratingCount = (summary == null || summary.getReviewCount() == null)
                ? 0
                : Math.toIntExact(summary.getReviewCount());
        boolean hasUndesiredIngredients = !undesiredIngredientIds.isEmpty() && m.getRecipes().stream()
                .flatMap(r -> r.getIngredients().stream())
                .anyMatch(i -> undesiredIngredientIds.contains(i.getIngredient().getId()));


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
                averageRating,
                ratingCount,
                hasUndesiredIngredients
        );
    }

    private Set<Long> getUndesiredIngredientIds(String email) {
        if (email == null || email.isBlank()) return Set.of();
        return userRepo.findByEmail(email)
                .map(u -> u.getUndesiredIngredients().stream()
                        .map(IngredientModel::getId)
                        .collect(Collectors.toSet()))
                .orElse(Set.of());
    }

}
