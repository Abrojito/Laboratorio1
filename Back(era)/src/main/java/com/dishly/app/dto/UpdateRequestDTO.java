package com.dishly.app.dto;

public record UpdateRequestDTO(
        String username,
        String email,
        String password,
        String photo
) {}
