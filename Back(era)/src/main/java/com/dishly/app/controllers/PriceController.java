package com.dishly.app.controllers;

import com.dishly.app.dto.PriceQuoteRequestDTO;
import com.dishly.app.services.DemoPriceIndexService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/prices")
public class PriceController {

    private final DemoPriceIndexService demoPriceIndexService;

    public PriceController(DemoPriceIndexService demoPriceIndexService) {
        this.demoPriceIndexService = demoPriceIndexService;
    }

    @GetMapping("/search")
    public ResponseEntity<?> search(
            @RequestParam String query,
            @RequestParam(defaultValue = "10") int limit
    ) {
        if (!demoPriceIndexService.isLoaded()) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body("Price dataset not loaded");
        }
        return ResponseEntity.ok(demoPriceIndexService.search(query, limit));
    }

    @PostMapping("/quote")
    public ResponseEntity<?> quote(@RequestBody(required = false) PriceQuoteRequestDTO request) {
        if (!demoPriceIndexService.isLoaded()) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body("Price dataset not loaded");
        }
        return ResponseEntity.ok(demoPriceIndexService.quote(request == null ? null : request.items()));
    }
}

