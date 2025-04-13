package com.dishly.app.services;

import com.dishly.app.dto.userdto.LoginRequest;
import com.dishly.app.dto.userdto.RegisterRequest;
import com.dishly.app.dto.userdto.UpdateRequest;
import com.dishly.app.models.UserModel;
import com.dishly.app.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    @Autowired
    private UserRepository repository;
    @Autowired private PasswordEncoder encoder;

    public UserModel register(RegisterRequest req) {
        UserModel user = new UserModel();
        user.setUsername(req.username());
        user.setPassword(encoder.encode(req.password()));
        user.setEmail(req.email());
        return repository.save(user);
    }

    public List<UserModel> getAll() {
        return repository.findAll();
    }

    public Optional<UserModel> getById(Long id) {
        return repository.findById(id);
    }

    public UserModel update(Long id, UpdateRequest req) {
        UserModel user = repository.findById(id).orElseThrow();
        user.setPassword(req.password());
        user.setEmail(req.email());
        return repository.save(user);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
    public UserModel login(LoginRequest req) {
        UserModel user = repository.findByEmail(req.email())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!encoder.matches(req.password(), user.getPassword())) {
            throw new RuntimeException("Contraseña incorrecta");
        }

        return user;
    }
}
