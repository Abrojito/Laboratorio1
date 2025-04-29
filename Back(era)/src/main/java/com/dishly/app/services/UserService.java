package com.dishly.app.services;

import com.dishly.app.dto.UserProfileDTO;
import com.dishly.app.dto.userdto.LoginRequest;
import com.dishly.app.dto.userdto.RegisterRequest;
import com.dishly.app.dto.userdto.UpdateRequest;
import com.dishly.app.dto.userdto.UserUpdateResponseDTO;
import com.dishly.app.models.UserModel;
import com.dishly.app.repositories.UserRepository;
import com.dishly.app.security.JwtUtil;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
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
        return repository.save(user);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }


    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        UserModel user = repository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return new org.springframework.security.core.userdetails.User(
                user.getEmail(), // sigue usando email para login
                user.getPassword(),
                List.of()
        );
    }

    public UserProfileDTO registerAndGetProfile(RegisterRequest req) {
        UserModel created = register(req);
        return toProfileDTO(created);
    }

    /**
     * Obtiene el perfil completo (id, username, fullName, photo) a partir del email.
     */
    @Transactional
    public UserProfileDTO getProfileByEmail(String email) {
        UserModel u = repository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));

        /* ── autoparche ─────────────────────────────────────────────── */
        if (u.getUsername() == null || u.getUsername().isBlank() || u.getUsername().contains("@")) {
            String alias = email.substring(0, email.indexOf('@'));
            u.setUsername(alias);
            repository.save(u);          // ←  lo corrige “en caliente”
        }
        /* ───────────────────────────────────────────────────────────── */

        return toProfileDTO(u);
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

    @Transactional
    public UserUpdateResponseDTO updateProfile(String email, UpdateRequest req, JwtUtil jwtUtil) {
        UserModel user = repository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + email));

        boolean changed = false;

        System.out.println("Username recibido: " + req.username());

        if (req.username() != null && !req.username().isBlank()) {
            if (!user.getUsername().equals(req.username())) {
                Optional<UserModel> existing = repository.findByUsername(req.username());
                if (existing.isPresent()) {
                    throw new IllegalArgumentException("El nombre de usuario ya está en uso");
                }
                user.setUsername(req.username());
                changed = true;
            }
        }

        if (req.password() != null && !req.password().isBlank()) {
            user.setPassword(encoder.encode(req.password()));
            changed = true;
        }

        if (req.photo() != null && !req.photo().isBlank()) {
            user.setPhoto(req.photo());
            changed = true;
        }

        if (changed) {
            repository.save(user);
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getUsername());
        return new UserUpdateResponseDTO(token);
    }



    // ==== Helper para mapear a DTO ====

    private UserProfileDTO toProfileDTO(UserModel u) {

        // ► alias “inteligente”
        String alias = u.getUsername();
        if (alias == null || alias.isBlank() || alias.contains("@")) {
            alias = u.getEmail().substring(0, u.getEmail().indexOf('@'));
        }

        return new UserProfileDTO(
                u.getId(),          // id
                alias,              // username  (alias)
                u.getEmail(),       // email
                u.getPassword(),    // password  (HASH, no plano)
                u.getFullName(),    // fullName
                u.getPhoto()        // photo
        );
    }
}
