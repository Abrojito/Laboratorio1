package com.dishly.app.services;

import com.dishly.app.dto.MealPrepResponseDTO;
import com.dishly.app.dto.RecipeResponseDTO;
import com.dishly.app.dto.UserProfileDTO;
import com.dishly.app.dto.userdto.RegisterRequest;
import com.dishly.app.dto.userdto.UpdateRequest;
import com.dishly.app.dto.userdto.UserUpdateResponseDTO;
import com.dishly.app.models.IngredientModel;
import com.dishly.app.models.UserModel;
import com.dishly.app.dto.UserPublicDTO;
import com.dishly.app.repositories.IngredientRepository;
import com.dishly.app.repositories.MealPrepRepository;
import com.dishly.app.repositories.RecipeRepository;
import com.dishly.app.repositories.UserRepository;
import com.dishly.app.security.JwtUtil;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;
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
    private IngredientRepository ingredientRepository;

    @Autowired
    private RecipeRepository recipeRepo;

    @Autowired
    private RecipeService recipeService;

    @Autowired
    private MealPrepService mealPrepService;

    @Autowired
    private MealPrepRepository mealPrepRepo;

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


    @Transactional(readOnly = true)
    public Page<IngredientModel> getUndesiredIngredients(Long userId, Pageable pageable) {
        List<IngredientModel> all = repository.findById(userId)
                .map(UserModel::getUndesiredIngredients)
                .orElse(List.of());

        int start = (int) pageable.getOffset();
        int end   = Math.min(start + pageable.getPageSize(), all.size());

        List<IngredientModel> sub = (start >= all.size()) ? List.of() : all.subList(start, end);

        return new PageImpl<>(sub, pageable, all.size());
    }

    public void addUndesiredIngredient(Long username, Long ingredientId) {
        UserModel user = repository.findById(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + username));
        System.out.println("Adding ingredient ID: " + ingredientId + " to user: " + user);
        IngredientModel ingredient = ingredientRepository.findById(ingredientId)
                .orElseThrow(() -> new IllegalArgumentException("Ingredient not found with ID: " + ingredientId));
        System.out.println("Found ingredient: " + ingredient.getName());
        if (!user.getUndesiredIngredients().contains(ingredient)) {
            user.getUndesiredIngredients().add(ingredient);
            repository.save(user);
        }
    }


    public void removeUndesiredIngredient(Long username, Long ingredientId) {
        UserModel user = repository.findById(username).orElseThrow();
        user.getUndesiredIngredients().removeIf(i -> i.getId().equals(ingredientId));
        repository.save(user);
    }


    public void follow(String email, Long targetId) {
        UserModel user = getByEmail(email).orElseThrow(() -> new EntityNotFoundException("User not found with email: " + email));
        UserModel target = getById(targetId).orElseThrow();
        if (!target.getFollowers().contains(user)) {
            target.getFollowers().add(user);
            repository.save(target);
        }
    }

    public void unfollow(String email, Long targetId) {
        UserModel user = getByEmail(email).orElseThrow(() -> new EntityNotFoundException("User not found with email: " + email));
        UserModel target = getById(targetId).orElseThrow();
        target.getFollowers().remove(user);
        repository.save(target);
    }

    public List<UserProfileDTO> getFollowers(Long userId, String requesterEmail) {
        UserModel requester = getByEmail(requesterEmail).orElseThrow();
        return repository.findById(userId)
                .orElseThrow()
                .getFollowers()
                .stream()
                .map(u -> toProfileDTO(u, requester))
                .toList();
    }

    public List<UserProfileDTO> getFollowing(Long userId, String requesterEmail) {
        UserModel requester = getByEmail(requesterEmail).orElseThrow();
        return repository.findById(userId)
                .orElseThrow()
                .getFollowing()
                .stream()
                .map(u -> toProfileDTO(u, requester))
                .toList();
    }



    public List<UserProfileDTO> searchUsers(String term, String requesterEmail) {
        UserModel requester = getByEmail(requesterEmail).orElseThrow();
        return repository.findAll().stream()
                .filter(u -> u.getUsername().toLowerCase().contains(term.toLowerCase()))
                .map(u -> toProfileDTO(u, requester))
                .toList();
    }


    @Transactional
    public UserPublicDTO getPublicProfile(Long userId, String myEmail) {
        UserModel target = getById(userId).orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));;
        UserModel me = getByEmail(myEmail).orElseThrow(() -> new EntityNotFoundException("User not found with email: " + myEmail));

        boolean followedByMe = target.getFollowers().contains(me);

        List<RecipeResponseDTO> publicRecipes = recipeRepo.findByUserIdAndPublicRecipeTrue(userId)
                .stream().map(recipeService::toDTO).toList();

        List<MealPrepResponseDTO> publicMealPreps = mealPrepRepo.findByUserIdAndPublicMealPrepTrue(userId)
                .stream().map(mealPrepService::toDTO).toList();

        return new UserPublicDTO(
                target.getId(),
                target.getUsername(),
                target.getFullName(),
                target.getPhoto(),
                target.getFollowers().size(),
                target.getFollowing().size(),
                publicRecipes,
                publicMealPreps,
                followedByMe
        );
    }

    public UserProfileDTO toProfileDTO(UserModel user, UserModel me) {
        boolean followed = me.getFollowing().contains(user);
        return new UserProfileDTO(user.getId(), user.getUsername(), user.getFullName(), user.getPhoto(), followed,
                user.getFollowers().size(), user.getFollowing().size());
    }




    // ==== Helper para mapear a DTO ====

    private UserProfileDTO toProfileDTO(UserModel u) {
        String alias = u.getUsername();
        if (alias == null || alias.isBlank() || alias.contains("@")) {
            alias = u.getEmail().substring(0, u.getEmail().indexOf('@'));
        }

        return new UserProfileDTO(
                u.getId(),
                alias,
                u.getFullName(),
                u.getPhoto(),
                false,
                u.getFollowers().size(),
                u.getFollowing().size()
        );
    }

}
