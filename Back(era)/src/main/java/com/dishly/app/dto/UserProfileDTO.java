package com.dishly.app.dto;

public record UserProfileDTO(
        Long id,
        String username,
        String fullName,
        String photo,
        boolean followed,
        int followersCount,
        int followingCount
) {}
