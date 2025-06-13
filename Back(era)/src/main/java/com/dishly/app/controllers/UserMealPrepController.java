package com.dishly.app.controllers;

import com.dishly.app.dto.MealPrepResponseDTO;
import com.dishly.app.services.MealPrepService;
import com.dishly.app.services.UserService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users/me")
public class UserMealPrepController {

    private final MealPrepService mealPrepService;
    private final UserService userService;

    public UserMealPrepController(MealPrepService mealPrepService, UserService userService) {
        this.mealPrepService = mealPrepService;
        this.userService = userService;
    }

    @GetMapping("/mealpreps")
    public List<MealPrepResponseDTO> getMealPrepsForUser(Authentication auth) {
        Long uid = userService.getIdByEmail(auth.getName());
        return mealPrepService.getMealPrepsByUser(uid);
    }
}

