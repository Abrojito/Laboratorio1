package com.dishly.app.dto;

import lombok.Data;

@Data
public class MealPrepReviewRequestDTO {

    private String comment;
    private Integer rating;
    private String username;
}
