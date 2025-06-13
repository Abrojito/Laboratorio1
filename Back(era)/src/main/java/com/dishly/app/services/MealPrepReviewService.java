package com.dishly.app.services;

import com.dishly.app.dto.MealPrepReviewDTO;
import com.dishly.app.dto.MealPrepReviewRequestDTO;
import com.dishly.app.models.MealPrepModel;
import com.dishly.app.models.MealPrepReviewModel;
import com.dishly.app.models.UserModel;
import com.dishly.app.repositories.MealPrepRepository;
import com.dishly.app.repositories.MealPrepReviewRepository;
import com.dishly.app.repositories.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MealPrepReviewService {

    private final MealPrepReviewRepository reviewRepository;
    private final MealPrepRepository mealPrepRepository;
    private final UserRepository userRepository;

    @Transactional
    public void create(Long mealPrepId, MealPrepReviewRequestDTO dto) {
        MealPrepModel mealPrep = mealPrepRepository.findById(mealPrepId)
                .orElseThrow(() -> new EntityNotFoundException("MealPrep no encontrado"));

        UserModel user = userRepository.findByUsername(dto.getUsername())
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

        MealPrepReviewModel review = new MealPrepReviewModel();
        review.setMealPrep(mealPrep);
        review.setUser(user);
        review.setComment(dto.getComment());
        review.setRating(dto.getRating());
        review.setCreatedAt(ZonedDateTime.now());

        reviewRepository.save(review);
    }


    public List<MealPrepReviewDTO> getAllByMealPrep(Long mealPrepId) {
        MealPrepModel mealPrep = mealPrepRepository.findById(mealPrepId)
                .orElseThrow(() -> new EntityNotFoundException("MealPrep not found"));

        return reviewRepository.findByMealPrep(mealPrep)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    private MealPrepReviewDTO toDTO(MealPrepReviewModel review) {
        MealPrepReviewDTO dto = new MealPrepReviewDTO();
        dto.setId(review.getId());
        dto.setComment(review.getComment());
        dto.setRating(review.getRating());
        dto.setCreatedAt(review.getCreatedAt());
        dto.setUsername(review.getUser().getUsername());
        dto.setUserPhoto(review.getUser().getPhoto());
        return dto;
    }
}
