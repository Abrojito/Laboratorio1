package com.dishly.app.controllers;

import com.dishly.app.dto.CollectionRequestDTO;
import com.dishly.app.dto.CollectionResponseDTO;
import com.dishly.app.dto.MealPrepSummaryDTO;
import com.dishly.app.dto.PagedResponse;
import com.dishly.app.dto.RecipeSummaryDTO;
import com.dishly.app.security.JwtUtil;
import com.dishly.app.services.CollectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/collections")
@RequiredArgsConstructor
public class CollectionController {

    private final CollectionService collectionService;
    private final JwtUtil jwtUtil;

    @GetMapping
    public ResponseEntity<List<CollectionResponseDTO>> getCollections(
            @RequestHeader("Authorization") String token) {
        String email = jwtUtil.getEmailFromHeader(token);
        return ResponseEntity.ok(collectionService.getUserCollections(email));
    }

    @PostMapping
    public ResponseEntity<CollectionResponseDTO> create(
            @RequestBody CollectionRequestDTO dto,
            @RequestHeader("Authorization") String token) {
        String email = jwtUtil.getEmailFromHeader(token);
        return ResponseEntity.ok(collectionService.createCollection(dto, email));
    }

    @PutMapping("/{collectionId}/add-recipe/{recipeId}")
    public ResponseEntity<CollectionResponseDTO> addRecipe(
            @PathVariable Long collectionId,
            @PathVariable Long recipeId,
            @RequestHeader("Authorization") String token) {
        String email = jwtUtil.getEmailFromHeader(token);
        return ResponseEntity.ok(collectionService.addRecipe(collectionId, recipeId, email));
    }

    @PutMapping("/{collectionId}/add-mealprep/{mealPrepId}")
    public ResponseEntity<CollectionResponseDTO> addMealPrep(
            @PathVariable Long collectionId,
            @PathVariable Long mealPrepId,
            @RequestHeader("Authorization") String token) {
        String email = jwtUtil.getEmailFromHeader(token);
        return ResponseEntity.ok(collectionService.addMealPrep(collectionId, mealPrepId, email));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token) {
        String email = jwtUtil.getEmailFromHeader(token);
        collectionService.deleteCollection(id, email);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{collectionId}/recipes/{recipeId}")
    public ResponseEntity<Void> removeRecipe(
            @PathVariable Long collectionId,
            @PathVariable Long recipeId,
            @RequestHeader("Authorization") String token) {
        String email = jwtUtil.getEmailFromHeader(token);
        collectionService.removeRecipeFromCollection(email, collectionId, recipeId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{collectionId}/mealpreps/{mealPrepId}")
    public ResponseEntity<Void> removeMealPrep(
            @PathVariable Long collectionId,
            @PathVariable Long mealPrepId,
            @RequestHeader("Authorization") String token) {
        String email = jwtUtil.getEmailFromHeader(token);
        collectionService.removeMealPrepFromCollection(email, collectionId, mealPrepId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{collectionId}/recipes/cursor")
    public ResponseEntity<PagedResponse<RecipeSummaryDTO>> getCollectionRecipesByCursor(
            @PathVariable Long collectionId,
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "10") int limit,
            @RequestHeader("Authorization") String token) {
        String email = jwtUtil.getEmailFromHeader(token);
        return ResponseEntity.ok(collectionService.getCollectionRecipesByCursor(email, collectionId, cursor, limit));
    }

    @GetMapping("/{collectionId}/mealpreps/cursor")
    public ResponseEntity<PagedResponse<MealPrepSummaryDTO>> getCollectionMealPrepsByCursor(
            @PathVariable Long collectionId,
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "10") int limit,
            @RequestHeader("Authorization") String token) {
        String email = jwtUtil.getEmailFromHeader(token);
        return ResponseEntity.ok(collectionService.getCollectionMealPrepsByCursor(email, collectionId, cursor, limit));
    }
}
