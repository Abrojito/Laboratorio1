package com.dishly.app.controllers;

import com.dishly.app.models.RecipeModel;
import com.dishly.app.services.RecipeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/recipes")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class RecipeController {
    @Autowired
    private RecipeService service;

    @GetMapping
    public List<RecipeModel> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<RecipeModel> getById(@PathVariable Long id) {
        return service.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public List<RecipeModel> search(@RequestParam String term) {
        return service.searchByName(term);
    }

    @GetMapping("/category/{category}")
    public List<RecipeModel> getByCategory(@PathVariable String category) {
        return service.findByCategory(category);
    }

    @GetMapping("/author/{authorId}")
    public List<RecipeModel> getByAuthor(@PathVariable Long authorId) {
        return service.findByAuthorId(authorId);
    }

    @PostMapping
    public ResponseEntity<RecipeModel> create(@RequestBody RecipeModel recipe) {
        return ResponseEntity.ok(service.save(recipe));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RecipeModel> update(@PathVariable Long id, @RequestBody RecipeModel recipe) {
        return service.update(id, recipe)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
