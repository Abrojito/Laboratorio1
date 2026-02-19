package com.dishly.app.services;

import com.dishly.app.dto.*;
import com.dishly.app.models.*;
import com.dishly.app.repositories.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CollectionService {

    private final CollectionRepository collectionRepository;
    private final RecipeRepository recipeRepository;
    private final MealPrepRepository mealPrepRepository;
    private final UserRepository userRepository;

    @Transactional
    public List<CollectionResponseDTO> getUserCollections(String email) {
        UserModel user = userRepository.findByEmail(email).orElseThrow();
        return collectionRepository.findByUser(user)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public CollectionResponseDTO createCollection(CollectionRequestDTO request, String email) {
        UserModel user = userRepository.findByEmail(email).orElseThrow();
        CollectionModel collection = new CollectionModel();
        collection.setName(request.getName());
        collection.setUser(user);

        if (request.getRecipeIds() != null) {
            List<RecipeModel> recipes = recipeRepository.findAllById(request.getRecipeIds());
            collection.getRecipes().addAll(recipes);
        }

        if (request.getMealPrepIds() != null) {
            List<MealPrepModel> mealPreps = mealPrepRepository.findAllById(request.getMealPrepIds());
            collection.getMealPreps().addAll(mealPreps);
        }

        return toDTO(collectionRepository.save(collection));
    }

    @Transactional
    public CollectionResponseDTO addRecipe(Long collectionId, Long recipeId, String email) {
        UserModel user = userRepository.findByEmail(email).orElseThrow();
        CollectionModel collection = collectionRepository.findByIdAndUser(collectionId, user).orElseThrow();
        RecipeModel recipe = recipeRepository.findById(recipeId).orElseThrow();
        collection.getRecipes().add(recipe);
        return toDTO(collectionRepository.save(collection));
    }

    @Transactional
    public CollectionResponseDTO addMealPrep(Long collectionId, Long mealPrepId, String email) {
        UserModel user = userRepository.findByEmail(email).orElseThrow();
        CollectionModel collection = collectionRepository.findByIdAndUser(collectionId, user).orElseThrow();
        MealPrepModel mealPrep = mealPrepRepository.findById(mealPrepId).orElseThrow();
        collection.getMealPreps().add(mealPrep);
        return toDTO(collectionRepository.save(collection));
    }

    @Transactional
    public void removeRecipeFromCollection(String email, Long collectionId, Long recipeId) {
        UserModel user = userRepository.findByEmail(email).orElseThrow();
        CollectionModel collection = collectionRepository.findByIdAndUser(collectionId, user).orElseThrow();
        collection.getRecipes().removeIf(r -> r.getId().equals(recipeId));
        collectionRepository.save(collection);
    }

    @Transactional
    public void removeMealPrepFromCollection(String email, Long collectionId, Long mealPrepId) {
        UserModel user = userRepository.findByEmail(email).orElseThrow();
        CollectionModel collection = collectionRepository.findByIdAndUser(collectionId, user).orElseThrow();
        collection.getMealPreps().removeIf(mp -> mp.getId().equals(mealPrepId));
        collectionRepository.save(collection);
    }

    @Transactional
    public void deleteCollection(Long id, String email) {
        UserModel user = userRepository.findByEmail(email).orElseThrow();
        CollectionModel collection = collectionRepository.findByIdAndUser(id, user).orElseThrow();
        collectionRepository.delete(collection);
    }

    @Transactional
    public PagedResponse<RecipeSummaryDTO> getCollectionRecipesByCursor(String email, Long collectionId, String cursor, int limit) {
        UserModel user = userRepository.findByEmail(email).orElseThrow();
        collectionRepository.findByIdAndUser(collectionId, user).orElseThrow();

        int safeLimit = limit > 0 ? limit : 10;
        Pageable pageable = PageRequest.of(0, safeLimit + 1);

        List<RecipeModel> recipeModels;
        if (cursor == null || cursor.isBlank()) {
            recipeModels = collectionRepository.findRecipesByCollectionAndUserOrderByIdDesc(collectionId, user.getId(), pageable);
        } else {
            Long cursorId = Long.parseLong(cursor);
            recipeModels = collectionRepository.findRecipesByCollectionAndUserAndCursorOrderByIdDesc(
                    collectionId, user.getId(), cursorId, pageable
            );
        }

        boolean hasNext = recipeModels.size() > safeLimit;
        List<RecipeModel> pageModels = hasNext ? recipeModels.subList(0, safeLimit) : recipeModels;

        List<RecipeSummaryDTO> items = pageModels.stream()
                .map(r -> new RecipeSummaryDTO(r.getId(), r.getName(), r.getImage()))
                .collect(Collectors.toList());

        String nextCursor = hasNext && !items.isEmpty()
                ? String.valueOf(items.get(items.size() - 1).id())
                : null;

        return new PagedResponse<>(items, nextCursor, hasNext);
    }

    @Transactional
    public PagedResponse<MealPrepSummaryDTO> getCollectionMealPrepsByCursor(String email, Long collectionId, String cursor, int limit) {
        UserModel user = userRepository.findByEmail(email).orElseThrow();
        collectionRepository.findByIdAndUser(collectionId, user).orElseThrow();

        int safeLimit = limit > 0 ? limit : 10;
        Pageable pageable = PageRequest.of(0, safeLimit + 1);

        List<MealPrepModel> mealPrepModels;
        if (cursor == null || cursor.isBlank()) {
            mealPrepModels = collectionRepository.findMealPrepsByCollectionAndUserOrderByIdDesc(collectionId, user.getId(), pageable);
        } else {
            Long cursorId = Long.parseLong(cursor);
            mealPrepModels = collectionRepository.findMealPrepsByCollectionAndUserAndCursorOrderByIdDesc(
                    collectionId, user.getId(), cursorId, pageable
            );
        }

        boolean hasNext = mealPrepModels.size() > safeLimit;
        List<MealPrepModel> pageModels = hasNext ? mealPrepModels.subList(0, safeLimit) : mealPrepModels;

        List<MealPrepSummaryDTO> items = pageModels.stream()
                .map(m -> new MealPrepSummaryDTO(m.getId(), m.getName(), m.getImage()))
                .collect(Collectors.toList());

        String nextCursor = hasNext && !items.isEmpty()
                ? String.valueOf(items.get(items.size() - 1).getId())
                : null;

        return new PagedResponse<>(items, nextCursor, hasNext);
    }


    private CollectionResponseDTO toDTO(CollectionModel collection) {
        List<RecipeSummaryDTO> recipeSummaries = collection.getRecipes().stream()
                .map(r -> new RecipeSummaryDTO(r.getId(), r.getName(), r.getImage()))
                .collect(Collectors.toList());

        List<MealPrepSummaryDTO> mealPrepSummaries = collection.getMealPreps().stream()
                .map(m -> new MealPrepSummaryDTO(m.getId(), m.getName(), m.getImage()))
                .collect(Collectors.toList());

        return new CollectionResponseDTO(collection.getId(), collection.getName(), recipeSummaries, mealPrepSummaries);
    }
}
