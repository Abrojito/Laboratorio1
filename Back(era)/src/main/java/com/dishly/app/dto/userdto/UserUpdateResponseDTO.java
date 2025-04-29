package com.dishly.app.dto.userdto;

import lombok.Getter;

@Getter
public class UserUpdateResponseDTO {

    private String token;

    public UserUpdateResponseDTO(String token) {
        this.token = token;
    }

}
