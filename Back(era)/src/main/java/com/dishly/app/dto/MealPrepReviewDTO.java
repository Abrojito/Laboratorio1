package com.dishly.app.dto;

import lombok.Data;

import java.time.ZonedDateTime;

@Data
public class MealPrepReviewDTO {

    private Long id;
    private String comment;
    private Integer rating;
    private String username;
    private String userPhoto;
    private ZonedDateTime createdAt;
}
