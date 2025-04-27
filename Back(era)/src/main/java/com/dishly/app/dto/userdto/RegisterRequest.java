package com.dishly.app.dto.userdto;

public record RegisterRequest(
        String username,
        String password,
        String email) {
}

