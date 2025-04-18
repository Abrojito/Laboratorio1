package com.dishly.app.controllers;

import com.dishly.app.dto.RecipeRequestDTO;
import com.dishly.app.dto.RecipeResponseDTO;
import com.dishly.app.services.RecipeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recipes")
public class RecipeController {

    private final RecipeService service;

    public RecipeController(RecipeService service) {
        this.service = service;
    }

    /* ---------- GETs ---------- */

    @GetMapping
    public List<RecipeResponseDTO> getAll() {
        return service.getAll();
    }

    @GetMapping("{id}")
    public RecipeResponseDTO getById(@PathVariable Long id) {
        return service.getById(id);
    }

    /* ---------- POST ---------- */

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RecipeResponseDTO create(@RequestBody @Valid RecipeRequestDTO dto) {
        return service.create(dto);
    }

    /* ---------- PUT ---------- */

    @PutMapping("{id}")
    public RecipeResponseDTO update(@PathVariable Long id,
                                    @RequestBody @Valid RecipeRequestDTO dto) {
        return service.update(id, dto);
    }

    /* ---------- DELETE ---------- */

    @DeleteMapping("{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
