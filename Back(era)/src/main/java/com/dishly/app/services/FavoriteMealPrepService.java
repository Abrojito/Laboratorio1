package com.dishly.app.services;

import com.dishly.app.dto.MealPrepResponseDTO;
import com.dishly.app.dto.PagedResponse;
import com.dishly.app.models.FavoriteMealPrepModel;
import com.dishly.app.models.IngredientModel;
import com.dishly.app.models.MealPrepModel;
import com.dishly.app.models.UserModel;
import com.dishly.app.repositories.FavoriteMealPrepRepository;
import com.dishly.app.repositories.MealPrepRepository;
import com.dishly.app.repositories.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FavoriteMealPrepService {

    private final FavoriteMealPrepRepository favoriteRepo;
    private final MealPrepRepository mealPrepRepo;
    private final UserRepository userRepo;
    private final MealPrepService mealPrepService;

    @Transactional
    public void toggleFavorite(String email, Long mealPrepId) {
        UserModel user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        MealPrepModel mp = mealPrepRepo.findById(mealPrepId)
                .orElseThrow(() -> new RuntimeException("MealPrep no encontrado"));

        if (favoriteRepo.existsByUserAndMealPrep(user, mp)) {
            favoriteRepo.deleteByUserAndMealPrep(user, mp);
        } else {
            FavoriteMealPrepModel fav = new FavoriteMealPrepModel();
            fav.setUser(user);
            fav.setMealPrep(mp);
            favoriteRepo.save(fav);
        }
    }

    @Transactional
    public List<MealPrepResponseDTO> getFavorites(String email) {
        UserModel user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        Set<Long> undesiredIngredientIds = user.getUndesiredIngredients().stream()
                .map(IngredientModel::getId)
                .collect(Collectors.toSet());
        return favoriteRepo.findByUser(user).stream()
                .map(f -> mealPrepService.toDTO(f.getMealPrep(), undesiredIngredientIds))
                .toList();
    }

    public boolean isFavorite(String email, Long mealPrepId) {
        UserModel user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        MealPrepModel mp = mealPrepRepo.findById(mealPrepId)
                .orElseThrow(() -> new RuntimeException("MealPrep no encontrado"));
        return favoriteRepo.existsByUserAndMealPrep(user, mp);
    }

    @Transactional
    public void removeFavoriteMealPrep(String email, Long mealPrepId) {
        UserModel user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        MealPrepModel mp = mealPrepRepo.findById(mealPrepId)
                .orElseThrow(() -> new RuntimeException("MealPrep no encontrado"));

        if (favoriteRepo.existsByUserAndMealPrep(user, mp)) {
            favoriteRepo.deleteByUserAndMealPrep(user, mp);
        }
    }


    @Transactional
    public Page<MealPrepResponseDTO> getFavMealPreps(Long userId, Pageable pageable) {
        Set<Long> undesiredIngredientIds = userRepo.findById(userId)
                .map(u -> u.getUndesiredIngredients().stream()
                        .map(IngredientModel::getId)
                        .collect(Collectors.toSet()))
                .orElse(Set.of());
        return favoriteRepo.findByUserId(userId, pageable)
                .map(fmp -> mealPrepService.toDTO(fmp.getMealPrep(), undesiredIngredientIds));
    }

    @Transactional
    public PagedResponse<MealPrepResponseDTO> getFavMealPrepsByCursor(String email, String cursor, int limit) {
        UserModel user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        Set<Long> undesiredIngredientIds = user.getUndesiredIngredients().stream()
                .map(IngredientModel::getId)
                .collect(Collectors.toSet());

        int safeLimit = limit > 0 ? limit : 10;
        Pageable pageable = PageRequest.of(0, safeLimit + 1);

        List<FavoriteMealPrepModel> favModels;
        if (cursor == null || cursor.isBlank()) {
            favModels = favoriteRepo.findByUserIdOrderByIdDesc(user.getId(), pageable);
        } else {
            Long cursorId = Long.parseLong(cursor);
            favModels = favoriteRepo.findByUserIdAndIdLessThanOrderByIdDesc(user.getId(), cursorId, pageable);
        }

        boolean hasNext = favModels.size() > safeLimit;
        List<FavoriteMealPrepModel> pageModels = hasNext
                ? favModels.subList(0, safeLimit)
                : favModels;

        List<MealPrepResponseDTO> items = pageModels.stream()
                .map(fmp -> mealPrepService.toDTO(fmp.getMealPrep(), undesiredIngredientIds))
                .toList();

        String nextCursor = hasNext && !pageModels.isEmpty()
                ? String.valueOf(pageModels.get(pageModels.size() - 1).getId())
                : null;

        return new PagedResponse<>(items, nextCursor, hasNext);
    }
}
