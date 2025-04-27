package com.dishly.app.dto;

public record UserProfileDTO(
        Long id,
        String username,
        String email,
        String password,
        String fullName,
        String photo  // base64/URL
) {}
