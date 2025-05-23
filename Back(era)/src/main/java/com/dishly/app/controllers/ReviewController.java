package com.dishly.app.controllers;

import com.dishly.app.dto.ReviewDTO;
import com.dishly.app.dto.ReviewRequestDTO;
import com.dishly.app.services.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recipes")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping("/{recipeId}/reviews")
    public ResponseEntity<Void> addReview(
            @PathVariable Long recipeId,
            @RequestBody ReviewRequestDTO dto
    ) {
        System.out.println("🌟 Recibida review para receta " + recipeId + " de " + dto.username());
        reviewService.addReview(recipeId, dto);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{recipeId}/reviews")
    public List<ReviewDTO> getReviews(@PathVariable Long recipeId) {
        return reviewService.getReviewsByRecipe(recipeId);
    }
}
