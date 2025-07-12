// src/api/favoriteApi.ts

import { authFetch } from "./config";
import { Recipe } from "../types/Recipe";
import { MealPrep } from "../types/MealPrep";
import { Page } from "../types/Page";

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


export async function fetchFavRecipesPage(
    page = 0,
    size = 6,
    token: string
): Promise<Page<Recipe>> {
    const res = await authFetch(
        `/favorites/recipes?page=${page}&size=${size}`,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) throw new Error("fetch fav recipes");
    return res.json();
}

/* meal-preps favoritas paginadas */
export async function fetchFavMealPrepsPage(
    page = 0,
    size = 6,
    token: string
): Promise<Page<MealPrep>> {
    const res = await authFetch(
        `/favorites/mealpreps?page=${page}&size=${size}`,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) throw new Error("fetch fav mealpreps");
    return res.json();
}
