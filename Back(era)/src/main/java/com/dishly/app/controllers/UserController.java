package com.dishly.app.controllers;

import com.dishly.app.dto.userdto.UserUpdateResponseDTO;
import com.dishly.app.dto.UserPublicDTO;
import com.dishly.app.security.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import com.dishly.app.dto.PhotoDTO;
import com.dishly.app.dto.RecipeResponseDTO;
import com.dishly.app.dto.UserProfileDTO;
import com.dishly.app.dto.userdto.RegisterRequest;
import com.dishly.app.dto.userdto.UpdateRequest;
import com.dishly.app.models.UserModel;
import com.dishly.app.services.RecipeService;
import com.dishly.app.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class UserController {

    private final JwtUtil jwtUtil;


    @Autowired
    private UserService service;

    @Autowired
    private RecipeService recipeService;

    public UserController(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @GetMapping
    public List<UserModel> list() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserModel> get(@PathVariable Long id) {
        return service.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/register")
    public ResponseEntity<UserModel> create(@RequestBody RegisterRequest req) {
        UserModel user = service.register(req);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserModel> update(@PathVariable Long id, @RequestBody UpdateRequest req) {
        UserModel user = service.update(id, req);
        return ResponseEntity.ok(user);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileDTO> getMyProfile(Authentication auth) {
        UserProfileDTO profile = service.getProfileByEmail(auth.getName());
        return ResponseEntity.ok(profile);
    }

    // 2) Cambiar o subir foto de perfil
    @PutMapping("/me/photo")
    public ResponseEntity<UserProfileDTO> updateMyPhoto(
            Authentication auth,
            @RequestBody PhotoDTO dto
    ) {
        UserProfileDTO updated = service.updatePhoto(auth.getName(), dto.getPhotoBase64());
        return ResponseEntity.ok(updated);
    }

    // 3) Eliminar mi propia cuenta
    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteMyAccount(Authentication auth) {
        service.deleteByEmail(auth.getName());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me/recipes")      //  /api/users/me/recipes?page=&size=
    public Page<RecipeResponseDTO> getMyRecipes(Authentication auth,
                                                Pageable pageable) {
        Long userId = service.getIdByEmail(auth.getName());
        return recipeService.getAllByUser(userId, pageable);
    }

    @PutMapping("/me/update")
    public ResponseEntity<UserUpdateResponseDTO> updateMyProfile(Authentication auth,
                                                                 @RequestBody @Valid UpdateRequest dto) {
        System.out.println("Payload recibido: " + dto);
        UserUpdateResponseDTO response = service.updateProfile(auth.getName(), dto, jwtUtil);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/follow")
    public ResponseEntity<Void> follow(@PathVariable Long id, Authentication auth) {
        service.follow(auth.getName(), id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/unfollow")
    public ResponseEntity<Void> unfollow(@PathVariable Long id, Authentication auth) {
        service.unfollow(auth.getName(), id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/followers")
    public List<UserProfileDTO> getFollowers(@PathVariable Long id, Authentication auth) {
        return service.getFollowers(id, auth.getName());
    }

    @GetMapping("/{id}/following")
    public List<UserProfileDTO> getFollowing(@PathVariable Long id, Authentication auth) {
        return service.getFollowing(id, auth.getName());
    }

    @GetMapping("/search")
    public List<UserProfileDTO> searchUsers(@RequestParam String term, Authentication auth) {
        return service.searchUsers(term, auth.getName());
    }

    @GetMapping("/{id}/public")
    public ResponseEntity<UserPublicDTO> getPublicProfile(@PathVariable Long id, Authentication auth) {
        UserPublicDTO dto = service.getPublicProfile(id, auth.getName());
        return ResponseEntity.ok(dto);
    }


}
