package com.dishly.app.controllers;

import com.dishly.app.dto.MealPrepResponseDTO;
import com.dishly.app.dto.PagedResponse;
import com.dishly.app.security.JwtUtil;
import com.dishly.app.services.FavoriteMealPrepService;
import com.dishly.app.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/favorites/mealpreps")
@RequiredArgsConstructor
public class FavoriteMealPrepController {

    private final FavoriteMealPrepService favoriteService;
    private final JwtUtil jwtUtil;
    private final UserService userService;

    @PostMapping("/{mealPrepId}")
    public void toggleFavorite(@PathVariable Long mealPrepId,
                               @RequestHeader("Authorization") String token) {
        String email = jwtUtil.getEmailFromHeader(token);
        favoriteService.toggleFavorite(email, mealPrepId);
    }

    @GetMapping            //  /api/favorites/mealpreps?page=0&size=6
    public Page<MealPrepResponseDTO> getMyFavMealPreps(Authentication auth,
                                                       Pageable pageable) {
        Long uid = userService.getIdByEmail(auth.getName());
        return favoriteService.getFavMealPreps(uid, pageable);
    }

    @GetMapping("/cursor")
    public PagedResponse<MealPrepResponseDTO> getMyFavMealPrepsByCursor(
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "10") int limit,
            @RequestHeader("Authorization") String token) {
        String email = jwtUtil.getEmailFromHeader(token);
        return favoriteService.getFavMealPrepsByCursor(email, cursor, limit);
    }

    @GetMapping("/{mealPrepId}/check")
    public boolean isFavorite(@PathVariable Long mealPrepId,
                              @RequestHeader("Authorization") String token) {
        String email = jwtUtil.getEmailFromHeader(token);
        return favoriteService.isFavorite(email, mealPrepId);
    }

    @DeleteMapping("/{mealPrepId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeFavorite(@PathVariable Long mealPrepId,
                               @RequestHeader("Authorization") String token) {
        String email = jwtUtil.getEmailFromHeader(token);
        favoriteService.removeFavoriteMealPrep(email, mealPrepId);
    }
}
