package com.dishly.app.services;

import com.dishly.app.dto.ReviewDTO;
import com.dishly.app.dto.ReviewRequestDTO;
import com.dishly.app.models.RecipeModel;
import com.dishly.app.models.ReviewModel;
import com.dishly.app.models.UserModel;
import com.dishly.app.repositories.RecipeRepository;
import com.dishly.app.repositories.ReviewRepository;
import com.dishly.app.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final RecipeRepository recipeRepository;
    private final UserRepository userRepository;

    public void addReview(Long recipeId, ReviewRequestDTO dto) {
        RecipeModel recipe = recipeRepository.findById(recipeId).orElseThrow();
        UserModel user = userRepository.findByUsername(dto.username()).orElseThrow(); // 👈 búsqueda por username

        // Reutiliza review si ya existe
        ReviewModel review = reviewRepository.findByRecipeAndUser(recipe, user)
                .orElse(new ReviewModel());

        review.setRecipe(recipe);
        review.setUser(user);
        review.setComment(dto.comment());
        review.setRating(dto.rating());

        reviewRepository.save(review);
    }

    public List<ReviewDTO> getReviewsByRecipe(Long recipeId) {
        RecipeModel recipe = recipeRepository.findById(recipeId).orElseThrow();

        return reviewRepository.findByRecipe(recipe).stream().map(r -> new ReviewDTO(
                r.getId(),
                r.getComment(),
                r.getRating(),
                r.getUser().getUsername(),
                r.getUser().getPhoto(),
                r.getCreatedAt().toString()
        )).toList();
    }
}

