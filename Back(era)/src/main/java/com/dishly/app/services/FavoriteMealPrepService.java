package com.dishly.app.services;

import com.dishly.app.dto.MealPrepResponseDTO;
import com.dishly.app.models.FavoriteMealPrepModel;
import com.dishly.app.models.MealPrepModel;
import com.dishly.app.models.UserModel;
import com.dishly.app.repositories.FavoriteMealPrepRepository;
import com.dishly.app.repositories.MealPrepRepository;
import com.dishly.app.repositories.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

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
        return favoriteRepo.findByUser(user).stream()
                .map(f -> mealPrepService.toDTO(f.getMealPrep()))
                .toList();
    }

    public boolean isFavorite(String email, Long mealPrepId) {
        UserModel user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        MealPrepModel mp = mealPrepRepo.findById(mealPrepId)
                .orElseThrow(() -> new RuntimeException("MealPrep no encontrado"));
        return favoriteRepo.existsByUserAndMealPrep(user, mp);
    }
}
