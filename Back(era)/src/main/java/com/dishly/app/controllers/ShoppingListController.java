package com.dishly.app.controllers;

import com.dishly.app.dto.ShoppingListRequestDTO;
import com.dishly.app.dto.ShoppingListResponseDTO;
import com.dishly.app.security.JwtUtil;
import com.dishly.app.services.ShoppingListService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shopping-lists")
@RequiredArgsConstructor
public class ShoppingListController {

    private final ShoppingListService shoppingListService;
    private final JwtUtil jwtUtil;

    @PostMapping
    public ShoppingListResponseDTO create(Authentication auth, @RequestBody ShoppingListRequestDTO dto) {
        return shoppingListService.create(dto, auth.getName());
    }

    @GetMapping("/pending")
    public List<ShoppingListResponseDTO> getPending(Authentication auth) {
        return shoppingListService.getPending(auth.getName());
    }

    @GetMapping("/history")
    public List<ShoppingListResponseDTO> getHistory(Authentication auth) {
        return shoppingListService.getHistory(auth.getName());
    }

    @GetMapping("/{id}")
    public ShoppingListResponseDTO getById(@PathVariable Long id, Authentication auth) {
        return shoppingListService.getById(id, auth.getName());
    }

    @PutMapping("/{id}/items/{itemId}/toggle")
    public void toggleItem(@PathVariable Long id, @PathVariable Long itemId, Authentication auth) {
        shoppingListService.toggleItem(id, itemId, auth.getName());
    }

    @PutMapping("/{id}/repeat")
    public void repeat(@PathVariable Long id, Authentication auth) {
        shoppingListService.repeat(id, auth.getName());
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id, Authentication auth) {
        shoppingListService.delete(id, auth.getName());
    }

    @PutMapping("/{id}/add-recipes")
    public ResponseEntity<?> addRecipesToList(
            @PathVariable Long id,
            @RequestBody List<Long> recipeIds,
            @RequestHeader("Authorization") String authHeader
    ) {
        String email = jwtUtil.getEmailFromHeader(authHeader);
        shoppingListService.addRecipesToExistingList(id, recipeIds, email);
        return ResponseEntity.ok().build();
    }

}
