package com.dishly.app.controllers;

import com.dishly.app.dto.RecipeRequestDTO;
import com.dishly.app.dto.RecipeResponseDTO;
import com.dishly.app.services.RecipeService;
import com.dishly.app.services.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;   // <-- importa esto
import org.springframework.web.bind.annotation.*;

import java.nio.file.AccessDeniedException;
import java.util.List;

@RestController
@RequestMapping("/api/recipes")
public class RecipeController {

    /* === inyecciones ============================ */
    private final RecipeService recipeService;
    private final UserService   userService;

    public RecipeController(RecipeService recipeService,
                            UserService   userService) {
        this.recipeService = recipeService;
        this.userService   = userService;
    }

    /* ---------- GETs ---------- */

    @GetMapping            //  /api/recipes
    public List<RecipeResponseDTO> getAllPublic() {
        return recipeService.getPublic();      // nuevo wrapper
    }

    @GetMapping("{id}")
    public RecipeResponseDTO getById(@PathVariable Long id) {
        return recipeService.getById(id);
    }

    @GetMapping("/search")
    public List<RecipeResponseDTO> searchRecipes(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String ingredient,
            @RequestParam(required = false) String author
    ) {
        return recipeService.search(name, ingredient, author);
    }


    /* ---------- POST ---------- */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RecipeResponseDTO create(Authentication auth,
                                    @RequestBody @Valid RecipeRequestDTO dto) {
        Long uid = userService.getIdByEmail(auth.getName());
        System.out.println(uid);
        return recipeService.createForUser(dto, uid);
    }

    /* ---------- PUT ---------- */
    @PutMapping("{id}")
    public RecipeResponseDTO update(@PathVariable Long id,
                                    Authentication auth,
                                    @RequestBody @Valid RecipeRequestDTO dto) throws AccessDeniedException {
        return recipeService.update(id, dto, auth.getName());
    }


    /* ---------- DELETE ---------- */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRecipe(@PathVariable Long id, Authentication auth) throws AccessDeniedException {
        recipeService.deleteRecipe(id, auth.getName());  // auth.getName() es el email del usuario logueado
        return ResponseEntity.noContent().build();
    }

}
