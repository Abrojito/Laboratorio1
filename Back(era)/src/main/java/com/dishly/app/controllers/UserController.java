package com.dishly.app.controllers;

import org.springframework.security.core.Authentication;
import com.dishly.app.dto.PhotoDTO;
import com.dishly.app.dto.RecipeResponseDTO;
import com.dishly.app.dto.UserProfileDTO;
import com.dishly.app.dto.userdto.LoginRequest;
import com.dishly.app.dto.userdto.RegisterRequest;
import com.dishly.app.dto.userdto.UpdateRequest;
import com.dishly.app.models.UserModel;
import com.dishly.app.services.RecipeService;
import com.dishly.app.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class UserController {

    @Autowired
    private UserService service;

    @Autowired
    private RecipeService recipeService;

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

    // 4) Listar solo mis recetas
    @GetMapping("/me/recipes")
    public ResponseEntity<List<RecipeResponseDTO>> getMyRecipes(Authentication auth) {
        Long userId = service.getIdByEmail(auth.getName());
        List<RecipeResponseDTO> mine = recipeService.getAllByUser(userId);
        return ResponseEntity.ok(mine);
    }

    @PutMapping("/me/update")
    public ResponseEntity<UserProfileDTO> updateProfile(Authentication auth, @RequestBody UpdateRequest req) {
        System.out.println(req.photo());
        UserProfileDTO updated = service.updateProfile(auth.getName(), req);
        return ResponseEntity.ok(updated);
    }

}
