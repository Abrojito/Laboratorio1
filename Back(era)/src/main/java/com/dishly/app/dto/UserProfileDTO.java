package com.dishly.app.dto;

public record UserProfileDTO(
        Long id,
        String username,
        String fullName,
        String photo  // base64/URL
) {}
