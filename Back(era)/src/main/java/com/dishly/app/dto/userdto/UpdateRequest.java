package com.dishly.app.dto.userdto;

public record UpdateRequest(String username,
                            String email,
                            String password,
                            String photo)
{ }
