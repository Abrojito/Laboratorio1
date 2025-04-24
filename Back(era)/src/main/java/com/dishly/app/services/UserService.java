package com.dishly.app.services;

import com.dishly.app.dto.UserProfileDTO;
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
        if (repository.existsByUsername(req.username())) {
            throw new IllegalArgumentException("This username is already taken");
        }

        // Verificar si ya existe un usuario con el mismo email
        if (repository.existsByEmail(req.email())) {
            throw new IllegalArgumentException("Email already in use");
        }
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

    public UserProfileDTO registerAndGetProfile(RegisterRequest req) {
        UserModel created = register(req);
        return toProfileDTO(created);
    }

    /**
     * Obtiene el perfil completo (id, username, fullName, photo) a partir del email.
     */
    public UserProfileDTO getProfileByEmail(String email) {
        UserModel user = repository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + email));
        return toProfileDTO(user);
    }

    /**
     * Actualiza la foto de perfil (campo photo en la entidad) y devuelve el perfil actualizado.
     */
    public UserProfileDTO updatePhoto(String email, String photoBase64) {
        UserModel user = repository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + email));
        user.setPhoto(photoBase64);  // asumo que UserModel tiene setPhoto()
        repository.save(user);
        return toProfileDTO(user);
    }

    /**
     * Borra la cuenta de usuario dado su email.
     */
    public void deleteByEmail(String email) {
        UserModel user = repository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + email));
        repository.delete(user);
    }

    /**
     * Devuelve el id interno del usuario para luego listar sus recetas.
     */
    public Long getIdByEmail(String email) {
        return repository.findByEmail(email)
                .map(UserModel::getId)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + email));
    }

    // ==== Helper para mapear a DTO ====

    private UserProfileDTO toProfileDTO(UserModel u) {
        return new UserProfileDTO(
                u.getId(),
                u.getUsername(),
                u.getFullName(),
                u.getPhoto()        // asumo que UserModel tiene getPhoto()
        );
    }
}
