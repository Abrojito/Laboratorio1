package com.dishly.app.services;

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

    public UserModel register(String username, String password, String fullName) {
        UserModel user = new UserModel();
        user.setUsername(username);
        user.setPassword(encoder.encode(password));
        user.setFullName(fullName);
        return repository.save(user);
    }

    public List<UserModel> getAll() {
        return repository.findAll();
    }

    public Optional<UserModel> getById(Long id) {
        return repository.findById(id);
    }

    public UserModel update(Long id, String username, String fullName) {
        UserModel user = repository.findById(id).orElseThrow();
        user.setUsername(username);
        user.setFullName(fullName);
        return repository.save(user);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
