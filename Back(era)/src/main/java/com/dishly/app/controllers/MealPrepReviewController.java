package com.dishly.app.controllers;

import com.dishly.app.dto.MealPrepReviewDTO;
import com.dishly.app.dto.MealPrepReviewRequestDTO;
import com.dishly.app.services.MealPrepReviewService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mealpreps/{mealPrepId}/reviews")
public class MealPrepReviewController {

    private final MealPrepReviewService mealPrepReviewService;

    public MealPrepReviewController(MealPrepReviewService mealPrepReviewService) {
        this.mealPrepReviewService = mealPrepReviewService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public void create(@PathVariable Long mealPrepId,
                       @RequestBody @Valid MealPrepReviewRequestDTO dto) {
        mealPrepReviewService.create(mealPrepId, dto);
    }


    @GetMapping
    public List<MealPrepReviewDTO> getAll(@PathVariable Long mealPrepId) {
        return mealPrepReviewService.getAllByMealPrep(mealPrepId);
    }
}
