package com.dishly.app.dto;

public record ReviewDTO(
        Long id,
        String comment,
        int rating,
        String username,
        Long userId,
        String userPhoto,
        String createdAt
) {}
