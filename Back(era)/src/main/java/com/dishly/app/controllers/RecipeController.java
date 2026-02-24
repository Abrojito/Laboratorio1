package com.dishly.app.controllers;

import com.dishly.app.dto.RecipeRequestDTO;
import com.dishly.app.dto.RecipeResponseDTO;
import com.dishly.app.dto.PagedResponse;
import com.dishly.app.services.PdfExportService;
import com.dishly.app.services.RecipeService;
import com.dishly.app.services.UserService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
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
    private final PdfExportService pdfExportService;

    public RecipeController(RecipeService recipeService,
                            UserService   userService,
                            PdfExportService pdfExportService) {
        this.recipeService = recipeService;
        this.userService   = userService;
        this.pdfExportService = pdfExportService;
    }

    /* ---------- GETs ---------- */


    @GetMapping           // /api/recipes?page=&size=
    public Page<RecipeResponseDTO> getAllPublic(Pageable pageable, Authentication auth) {
        String email = auth != null ? auth.getName() : null;
        return recipeService.getPublic(pageable, email);
    }

    @GetMapping("/cursor")
    public PagedResponse<RecipeResponseDTO> getAllPublicByCursor(
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "10") int limit,
            Authentication auth) {
        String email = auth != null ? auth.getName() : null;
        return recipeService.getPublicByCursor(cursor, limit, email);
    }

    @GetMapping("/{id:\\d+}")
    public RecipeResponseDTO getById(@PathVariable Long id) {
        return recipeService.getById(id);
    }

    @GetMapping("/{id:\\d+}/pdf")
    public ResponseEntity<byte[]> exportRecipePdf(@PathVariable Long id) {
        byte[] pdf = pdfExportService.recipeToPdf(id);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"recipe-" + id + ".pdf\"")
                .body(pdf);
    }

    @GetMapping("/search")
    public List<RecipeResponseDTO> searchRecipes(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String ingredient,
            @RequestParam(required = false) String author,
            Authentication auth
    ) {
        String email = auth != null ? auth.getName() : null;
        return recipeService.search(name, ingredient, author, email);
    }

    @GetMapping("/search/cursor")
    public PagedResponse<RecipeResponseDTO> searchRecipesByCursor(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String ingredient,
            @RequestParam(required = false) String author,
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(defaultValue = "false") boolean onlyFollowing,
            @RequestParam(defaultValue = "false") boolean excludeUndesired,
            Authentication auth
    ) {
        String email = auth != null ? auth.getName() : null;
        return recipeService.searchByCursor(name, ingredient, author, cursor, limit, email, onlyFollowing, excludeUndesired);
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
