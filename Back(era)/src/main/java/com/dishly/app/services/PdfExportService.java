package com.dishly.app.services;

import com.dishly.app.dto.IngredientQuantityDTO;
import com.dishly.app.dto.MealPrepResponseDTO;
import com.dishly.app.dto.RecipeResponseDTO;
import com.dishly.app.dto.RecipeSummaryDTO;
import com.lowagie.text.Document;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class PdfExportService {

    private final RecipeService recipeService;
    private final MealPrepService mealPrepService;

    public PdfExportService(RecipeService recipeService, MealPrepService mealPrepService) {
        this.recipeService = recipeService;
        this.mealPrepService = mealPrepService;
    }

    public byte[] recipeToPdf(Long recipeId) {
        RecipeResponseDTO recipe = recipeService.getById(recipeId);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document();
        PdfWriter.getInstance(document, out);
        document.open();

        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
        Font sectionFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13);
        Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 11);

        document.add(new Paragraph(recipe.name(), titleFont));
        document.add(new Paragraph(" "));
        document.add(new Paragraph(
                "Autor: " + recipe.author()
                        + " | Fecha export: " + nowAsText()
                        + " | Rating: " + recipe.averageRating() + " (" + recipe.ratingCount() + ")",
                normalFont
        ));
        document.add(new Paragraph(" "));

        document.add(new Paragraph("Descripcion", sectionFont));
        document.add(new Paragraph(nullSafe(recipe.description()), normalFont));
        document.add(new Paragraph(" "));

        document.add(new Paragraph("Ingredientes", sectionFont));
        if (recipe.ingredients() == null || recipe.ingredients().isEmpty()) {
            document.add(new Paragraph("- Sin ingredientes", normalFont));
        } else {
            for (IngredientQuantityDTO ing : recipe.ingredients()) {
                document.add(new Paragraph(formatIngredientLine("- ", ing), normalFont));
            }
        }
        document.add(new Paragraph(" "));

        document.add(new Paragraph("Pasos", sectionFont));
        if (recipe.steps() == null || recipe.steps().isEmpty()) {
            document.add(new Paragraph("- Sin pasos", normalFont));
        } else {
            int i = 1;
            for (String step : recipe.steps()) {
                document.add(new Paragraph(i++ + ". " + nullSafe(step), normalFont));
            }
        }

        document.close();
        return out.toByteArray();
    }

    public byte[] mealPrepToPdf(Long mealPrepId) {
        MealPrepResponseDTO mealPrep = mealPrepService.getById(mealPrepId);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document();
        PdfWriter.getInstance(document, out);
        document.open();

        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
        Font sectionFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13);
        Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 11);

        document.add(new Paragraph(mealPrep.name(), titleFont));
        document.add(new Paragraph(" "));
        document.add(new Paragraph(
                "Autor: " + mealPrep.author()
                        + " | Fecha export: " + nowAsText()
                        + " | Rating: " + mealPrep.averageRating() + " (" + mealPrep.ratingCount() + ")",
                normalFont
        ));
        document.add(new Paragraph(" "));

        document.add(new Paragraph("Descripcion", sectionFont));
        document.add(new Paragraph(nullSafe(mealPrep.description()), normalFont));
        document.add(new Paragraph(" "));

        document.add(new Paragraph("Recetas incluidas", sectionFont));
        if (mealPrep.recipes() == null || mealPrep.recipes().isEmpty()) {
            document.add(new Paragraph("- Sin recetas", normalFont));
        } else {
            for (RecipeSummaryDTO recipeSummary : mealPrep.recipes()) {
                RecipeResponseDTO recipe = recipeService.getById(recipeSummary.id());
                document.add(new Paragraph("- " + recipe.name(), normalFont));
                if (recipe.ingredients() != null && !recipe.ingredients().isEmpty()) {
                    for (IngredientQuantityDTO ing : recipe.ingredients()) {
                        document.add(new Paragraph(formatIngredientLine("   - ", ing), normalFont));
                    }
                } else {
                    document.add(new Paragraph("   - Sin ingredientes", normalFont));
                }
            }
        }

        document.add(new Paragraph(" "));
        document.add(new Paragraph("Notas de MealPrep", sectionFont));
        document.add(new Paragraph(new Phrase("Este mealprep no define pasos propios en el modelo actual.", normalFont)));

        document.close();
        return out.toByteArray();
    }

    private String nowAsText() {
        return LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
    }

    private String nullSafe(String value) {
        return value == null ? "-" : value;
    }

    private String formatIngredientLine(String prefix, IngredientQuantityDTO ing) {
        String name = nullSafe(ing.getName());
        String quantity = ing.getQuantity();
        if (quantity == null || quantity.isBlank()) {
            return prefix + name;
        }
        return prefix + name + " (" + quantity + ")";
    }
}
