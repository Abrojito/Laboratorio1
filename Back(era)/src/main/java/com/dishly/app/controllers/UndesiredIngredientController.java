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
        Long uid = userService.getIdByEmail(auth.getName());
        return userService.getUndesiredIngredients(uid);
    }

    @PostMapping("/{ingredientId}")
    public void addUndesired(@PathVariable Long ingredientId, Authentication auth) {
        Long uid = userService.getIdByEmail(auth.getName());
        System.out.println("Adding undesired ingredient: " + ingredientId + " for user: " + auth.getName());
        userService.addUndesiredIngredient(uid, ingredientId);
    }

    @DeleteMapping("/{ingredientId}")
    public void removeUndesired(@PathVariable Long ingredientId, Authentication auth) {
        Long uid = userService.getIdByEmail(auth.getName());

        userService.removeUndesiredIngredient(uid, ingredientId);
    }

    @GetMapping("/test")
    public String test() {
        return "UndesiredIngredientController activo";
    }

}
