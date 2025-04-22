package com.dishly.app.dto;

import jakarta.validation.constraints.NotBlank;

public record PhotoDTO(
        @NotBlank String photoBase64
) {

    public String getPhotoBase64() {
        return this.photoBase64;
    }
}
