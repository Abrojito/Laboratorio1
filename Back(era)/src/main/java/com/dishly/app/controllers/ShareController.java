package com.dishly.app.controllers;

import com.dishly.app.dto.MealPrepResponseDTO;
import com.dishly.app.dto.RecipeResponseDTO;
import com.dishly.app.services.MealPrepService;
import com.dishly.app.services.RecipeService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ShareController {

    private static final String FRONTEND_BASE_URL = "http://localhost:5173";

    private final RecipeService recipeService;
    private final MealPrepService mealPrepService;

    public ShareController(RecipeService recipeService, MealPrepService mealPrepService) {
        this.recipeService = recipeService;
        this.mealPrepService = mealPrepService;
    }

    @GetMapping(value = "/share/recipes/{id}", produces = MediaType.TEXT_HTML_VALUE)
    @ResponseBody
    public String shareRecipe(@PathVariable Long id) {
        RecipeResponseDTO recipe = recipeService.getById(id);
        String title = safe(recipe.name());
        String description = safe(recipe.description());
        String image = safeUrl(recipe.image());
        String targetUrl = FRONTEND_BASE_URL + "/recipes/" + id;
        String ogUrl = "http://localhost:8080/share/recipes/" + id;
        return buildHtml(title, description, image, ogUrl, targetUrl);
    }

    @GetMapping(value = "/share/mealpreps/{id}", produces = MediaType.TEXT_HTML_VALUE)
    @ResponseBody
    public String shareMealPrep(@PathVariable Long id) {
        MealPrepResponseDTO mealPrep = mealPrepService.getById(id);
        String title = safe(mealPrep.name());
        String description = safe(mealPrep.description());
        String image = safeUrl(mealPrep.image());
        String targetUrl = FRONTEND_BASE_URL + "/mealpreps/" + id;
        String ogUrl = "http://localhost:8080/share/mealpreps/" + id;
        return buildHtml(title, description, image, ogUrl, targetUrl);
    }

    private String buildHtml(String title, String description, String image, String ogUrl, String targetUrl) {
        return """
                <!doctype html>
                <html lang="es">
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1">
                  <title>%s</title>
                  <meta property="og:title" content="%s">
                  <meta property="og:description" content="%s">
                  <meta property="og:image" content="%s">
                  <meta property="og:url" content="%s">
                  <meta property="og:type" content="website">
                  <meta http-equiv="refresh" content="0; url=%s">
                </head>
                <body>
                  <p>Redirigiendo... Si no funciona, abrí <a href="%s">este enlace</a>.</p>
                </body>
                </html>
                """.formatted(
                title, title, description, image, ogUrl, targetUrl, targetUrl
        );
    }

    private String safe(String value) {
        if (value == null) {
            return "";
        }
        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;");
    }

    private String safeUrl(String url) {
        String value = safe(url);
        return value.isBlank() ? FRONTEND_BASE_URL : value;
    }
}

