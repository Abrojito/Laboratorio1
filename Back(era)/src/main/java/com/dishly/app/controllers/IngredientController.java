package com.dishly.app.controllers;

import com.dishly.app.dto.IngredientDTO;
import com.dishly.app.models.IngredientModel;
import com.dishly.app.services.IngredientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/ingredients")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class IngredientController {

    @Autowired
    private IngredientService service;

    @GetMapping
    public List<IngredientModel> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<IngredientModel> getById(@PathVariable Long id) {
        return service.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public List<IngredientModel> search(@RequestParam String term) {
        return service.searchByName(term);
    }

    @PostMapping
    public ResponseEntity<IngredientDTO> validate(@RequestBody IngredientDTO ingredient) {
        return ResponseEntity.ok(service.validate(ingredient));
    }


}