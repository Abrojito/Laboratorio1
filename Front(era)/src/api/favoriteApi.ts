// src/api/favoriteApi.ts

import { authFetch } from "./config";
import { Recipe } from "./recipeApi";
import { MealPrep } from "../types/MealPrep";

/* ================== RECETAS ================== */

export const toggleFavorite = async (recipeId: number) => {
    const res = await authFetch(`/favorites/recipes/${recipeId}`, {
        method: 'POST',
    });
    if (!res.ok) throw new Error("No se pudo cambiar el estado de favorito de la receta");
};

export const isFavorite = async (recipeId: number): Promise<boolean> => {
    const res = await authFetch(`/favorites/recipes/${recipeId}`);
    if (!res.ok) throw new Error("Error verificando favorito de receta");
    return await res.json();
};

export const getFavorites = async (): Promise<Recipe[]> => {
    const res = await authFetch(`/favorites/recipes`);
    if (!res.ok) throw new Error("Error cargando recetas favoritas");
    return await res.json();
};

/* ================== MEALPREPS ================== */

export const toggleMealPrepFavorite = async (mealPrepId: number) => {
    const res = await authFetch(`/favorites/mealpreps/${mealPrepId}`, {
        method: 'POST',
    });
    if (!res.ok) throw new Error("No se pudo cambiar el estado de favorito del meal prep");
};

export const isMealPrepFavorite = async (mealPrepId: number): Promise<boolean> => {
    const res = await authFetch(`/favorites/mealpreps/${mealPrepId}/check`);
    if (!res.ok) throw new Error("Error verificando favorito de meal prep");
    return await res.json();
};

export const getMealPrepFavorites = async (): Promise<MealPrep[]> => {
    const res = await authFetch(`/favorites/mealpreps`);
    if (!res.ok) throw new Error("Error cargando meal preps favoritos");
    return await res.json();
};
