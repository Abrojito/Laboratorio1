package com.dishly.app.config;

import com.dishly.app.models.IngredientModel;
import com.dishly.app.repositories.IngredientRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.util.Arrays;
import java.util.List;


@Configuration
public class DataLoader {

    @Bean
    @Profile("!prod")
    CommandLineRunner initDatabase(IngredientRepository repository) {
        return args -> {

            // Lista de ingredientes comunes
            List<String> ingredients = Arrays.asList(
                    "Tomate", "Cebolla", "Ajo", "Pimiento", "Zanahoria",
                    "Papa", "Arroz", "Pasta", "Pollo", "Carne de res",
                    "Cerdo", "Pescado", "Atún", "Salmón", "Camarones",
                    "Huevo", "Leche", "Queso", "Manteca", "Aceite",
                    "Sal", "Pimienta", "Orégano", "Albahaca", "Cilantro",
                    "Comino", "Curry", "Canela", "Azúcar", "Miel", "Vinagre",
                    "Mayonesa", "Lechuga"
            );

            if (repository.count() == 0) {
                ingredients.forEach(name -> {
                    IngredientModel ingredient = new IngredientModel();
                    ingredient.setName(name);
                    repository.save(ingredient);
                });
            }
        };
    }
}