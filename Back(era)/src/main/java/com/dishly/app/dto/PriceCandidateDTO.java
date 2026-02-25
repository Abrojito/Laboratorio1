package com.dishly.app.dto;

public record PriceCandidateDTO(
        String description,
        double price,
        int score
) {}

