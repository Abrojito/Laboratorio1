package com.dishly.app.controllers;

import com.dishly.app.models.IngredientModel;
import com.dishly.app.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/undesired")
@RequiredArgsConstructor
public class UndesiredIngredientController {

    private final UserService userService;

    @GetMapping
    public List<IngredientModel> getUndesired(Authentication auth) {
        return userService.getUndesiredIngredients(auth.getName());
    }

    @PostMapping("/{ingredientId}")
    public void addUndesired(@PathVariable Long ingredientId, Authentication auth) {
        userService.addUndesiredIngredient(auth.getName(), ingredientId);
    }

    @DeleteMapping("/{ingredientId}")
    public void removeUndesired(@PathVariable Long ingredientId, Authentication auth) {
        userService.removeUndesiredIngredient(auth.getName(), ingredientId);
    }

    @GetMapping("/test")
    public String test() {
        return "UndesiredIngredientController activo";
    }

}
