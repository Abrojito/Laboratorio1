package com.dishly.app.services;

import com.dishly.app.dto.userdto.LoginRequest;
import com.dishly.app.dto.userdto.RegisterRequest;
import com.dishly.app.dto.userdto.UpdateRequest;
import com.dishly.app.models.UserModel;
import com.dishly.app.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService implements UserDetailsService {

    @Autowired
    private UserRepository repository;

    @Autowired
    private PasswordEncoder encoder;

    public UserModel register(RegisterRequest req) {
        UserModel user = new UserModel();
        user.setUsername(req.username());
        user.setPassword(encoder.encode(req.password())); // ¡encriptado!
        user.setEmail(req.email());
        return repository.save(user);
    }

    public List<UserModel> getAll() {
        return repository.findAll();
    }

    public Optional<UserModel> getById(Long id) {
        return repository.findById(id);
    }

    public Optional<UserModel> getByEmail(String email) {
        return repository.findByEmail(email);
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


    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        UserModel user = repository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado con email: " + email));

        System.out.println("🔍 Usuario encontrado: " + user.getEmail());
        System.out.println("🔐 Password en BD (hash): " + user.getPassword());
        return user;
    }
}
