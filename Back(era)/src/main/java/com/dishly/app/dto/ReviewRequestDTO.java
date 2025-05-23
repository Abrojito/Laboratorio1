package com.dishly.app.dto;

public record ReviewRequestDTO(
        String comment,
        Integer rating,
        String username)
{}