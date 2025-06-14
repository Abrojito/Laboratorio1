package com.dishly.app.services;

import com.dishly.app.dto.ShoppingListItemDTO;
import com.dishly.app.dto.ShoppingListRequestDTO;
import com.dishly.app.dto.ShoppingListResponseDTO;
import com.dishly.app.models.*;
import com.dishly.app.repositories.*;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.*;

@Service
public class ShoppingListService {

    private final ShoppingListRepository shoppingListRepo;
    private final UserRepository userRepo;
    private final RecipeRepository recipeRepo;
    private final MealPrepRepository mealPrepRepo;


    public ShoppingListService(ShoppingListRepository shoppingListRepo, UserRepository userRepo, RecipeRepository recipeRepo, MealPrepRepository mealPrepRepo) {
        this.shoppingListRepo = shoppingListRepo;
        this.userRepo = userRepo;
        this.recipeRepo = recipeRepo;
        this.mealPrepRepo = mealPrepRepo;
    }

    @Transactional
    public ShoppingListResponseDTO create(ShoppingListRequestDTO dto, String email) {
        UserModel user = userRepo.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

        ShoppingListModel list = new ShoppingListModel();
        list.setName(dto.name());
        list.setUserId(user.getId());
        list.setRecipeIds(dto.recipeIds());

        Map<String, AggregatedIngredient> aggregatedIngredients = new LinkedHashMap<>();

        for (Long recipeId : dto.recipeIds()) {
            RecipeModel recipe = recipeRepo.findById(recipeId)
                    .orElseThrow(() -> new EntityNotFoundException("Receta " + recipeId + " no encontrada"));

            for (RecipeIngredientModel ri : recipe.getIngredients()) {
                String key = ri.getIngredient().getName().toLowerCase();

                aggregatedIngredients.compute(key, (k, v) -> {
                    if (v == null) {
                        return new AggregatedIngredient(ri.getIngredient().getName(), ri.getQuantity(), recipe.getName());
                    } else {
                        v.appendQuantity(ri.getQuantity());
                        return v;
                    }
                });
            }
        }
        for (Long mealPrepId : dto.mealPrepIds()) {
            MealPrepModel mealPrep = mealPrepRepo.findById(mealPrepId)
                    .orElseThrow(() -> new EntityNotFoundException("MealPrep " + mealPrepId + " no encontrado"));

            for (RecipeModel recipe : mealPrep.getRecipes()) {
                for (RecipeIngredientModel ri : recipe.getIngredients()) {
                    String key = ri.getIngredient().getName().toLowerCase();

                    aggregatedIngredients.compute(key, (k, v) -> {
                        if (v == null) {
                            return new AggregatedIngredient(ri.getIngredient().getName(), ri.getQuantity(), recipe.getName());
                        } else {
                            v.appendQuantity(ri.getQuantity());
                            return v;
                        }
                    });
                }
            }
        }


        for (AggregatedIngredient agg : aggregatedIngredients.values()) {
            ShoppingListItemModel item = new ShoppingListItemModel();
            item.setIngredientName(agg.getIngredientName());
            item.setQuantity(agg.getTotalQuantity());
            item.setChecked(false);
            item.setSourceRecipeName(agg.getSourceRecipeName());
            item.setShoppingList(list);

            list.getItems().add(item);
        }

        shoppingListRepo.save(list);
        return toDTO(list);
    }

    @Transactional(readOnly = true)
    public List<ShoppingListResponseDTO> getPending(String email) {
        UserModel user = userRepo.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

        return shoppingListRepo.findByUserIdAndCompletedAtIsNull(user.getId())
                .stream().map(this::toDTO).toList();
    }

    @Transactional(readOnly = true)
    public List<ShoppingListResponseDTO> getHistory(String email) {
        UserModel user = userRepo.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

        return shoppingListRepo.findByUserIdAndCompletedAtIsNotNull(user.getId())
                .stream().map(this::toDTO).toList();
    }

    @Transactional(readOnly = true)
    public ShoppingListResponseDTO getById(Long id, String email) {
        UserModel user = userRepo.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

        ShoppingListModel list = shoppingListRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("ShoppingList no encontrada"));

        if (!list.getUserId().equals(user.getId())) {
            throw new SecurityException("No autorizado");
        }

        return toDTO(list);
    }

    @Transactional
    public void toggleItem(Long listId, Long itemId, String email) {
        ShoppingListModel list = shoppingListRepo.findById(listId)
                .orElseThrow(() -> new RuntimeException("List not found"));

        ShoppingListItemModel item = list.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Item not found in list"));

        item.setChecked(!item.isChecked());

        boolean allChecked = list.getItems().stream().allMatch(ShoppingListItemModel::isChecked);

        list.setCompletedAt(allChecked ? ZonedDateTime.now() : null);

        shoppingListRepo.save(list);
    }


    @Transactional
    public void repeat(Long listId, String email) {
        ShoppingListModel list = shoppingListRepo.findById(listId)
                .orElseThrow(() -> new EntityNotFoundException("ShoppingList no encontrada"));

        if (!list.getUserId().equals(userRepo.findByEmail(email)
                .orElseThrow().getId())) {
            throw new SecurityException("No autorizado");
        }

        list.setCompletedAt(null);
        list.getItems().forEach(item -> item.setChecked(false));
    }

    @Transactional
    public void delete(Long listId, String email) {
        ShoppingListModel list = shoppingListRepo.findById(listId)
                .orElseThrow(() -> new EntityNotFoundException("ShoppingList no encontrada"));

        if (!list.getUserId().equals(userRepo.findByEmail(email)
                .orElseThrow().getId())) {
            throw new SecurityException("No autorizado");
        }

        shoppingListRepo.delete(list);
    }

    private ShoppingListResponseDTO toDTO(ShoppingListModel list) {
        List<ShoppingListItemDTO> items = list.getItems().stream()
                .map(i -> new ShoppingListItemDTO(
                        i.getId(),
                        i.getIngredientName(),
                        i.getQuantity(),
                        i.isChecked(),
                        i.getSourceRecipeName()
                ))
                .toList();

        return new ShoppingListResponseDTO(
                list.getId(),
                list.getName(),
                list.getCreatedAt(),
                list.getCompletedAt(),
                items
        );
    }

    @Transactional
    public void addRecipesToExistingList(Long listId, List<Long> recipeIds, String email) {
        ShoppingListModel list = shoppingListRepo.findById(listId)
                .orElseThrow(() -> new EntityNotFoundException("Shopping list no encontrada"));
        if (!list.getUserId().equals(userRepo.findByEmail(email).orElseThrow().getId()))
            throw new SecurityException("No autorizado");

        for (Long recipeId : recipeIds) {
            RecipeModel recipe = recipeRepo.findById(recipeId)
                    .orElseThrow(() -> new EntityNotFoundException("Receta " + recipeId + " no encontrada"));

            for (RecipeIngredientModel ri : recipe.getIngredients()) {
                boolean alreadyExists = list.getItems().stream()
                        .anyMatch(item -> item.getIngredientName().equalsIgnoreCase(ri.getIngredient().getName()));
                if (!alreadyExists) {
                    ShoppingListItemModel item = new ShoppingListItemModel();
                    item.setIngredientName(ri.getIngredient().getName());
                    item.setQuantity(ri.getQuantity());
                    item.setSourceRecipeName(recipe.getName());
                    item.setChecked(false);
                    item.setShoppingList(list);
                    list.getItems().add(item);
                }
            }
        }
    }


    private static class AggregatedIngredient {
        private final String ingredientName;
        private String totalQuantity;
        private final String sourceRecipeName;

        public AggregatedIngredient(String ingredientName, String totalQuantity, String sourceRecipeName) {
            this.ingredientName = ingredientName;
            this.totalQuantity = totalQuantity;
            this.sourceRecipeName = sourceRecipeName;
        }

        public String getIngredientName() {
            return ingredientName;
        }

        public String getTotalQuantity() {
            return totalQuantity;
        }

        public String getSourceRecipeName() {
            return sourceRecipeName;
        }

        public void appendQuantity(String qty) {
            this.totalQuantity = this.totalQuantity + " + " + qty;
        }
    }
}
