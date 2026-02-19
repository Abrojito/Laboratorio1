import { PagedResponse } from "../types/Page";
import { Recipe } from "../types/Recipe";
const BASE_URL = "http://localhost:8080/api/collections";

export const fetchCollections = async (token: string) => {
    const res = await fetch(BASE_URL, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
};

export const createCollection = async (payload: any, token: string) => {
    const res = await fetch(BASE_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    });
    return res.json();
};

export const addRecipeToCollection = async (collectionId: number, recipeId: number, token: string) => {
    await fetch(`${BASE_URL}/${collectionId}/add-recipe/${recipeId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
    });
};

export const addMealPrepToCollection = async (collectionId: number, mealPrepId: number, token: string) => {
    await fetch(`${BASE_URL}/${collectionId}/add-mealprep/${mealPrepId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
    });
};

export const removeRecipeFromCollection = async (collectionId: number, recipeId: number, token: string) => {
    await fetch(`${BASE_URL}/${collectionId}/recipes/${recipeId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
    });
};

export const removeMealPrepFromCollection = async (collectionId: number, mealPrepId: number, token: string) => {
    await fetch(`${BASE_URL}/${collectionId}/mealpreps/${mealPrepId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
    });
};

export const fetchCollectionRecipesCursorPage = async (
    collectionId: number,
    cursor: string | null,
    limit: number,
    token: string
): Promise<PagedResponse<Recipe>> => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (cursor !== null) params.set("cursor", cursor);

    const res = await fetch(`${BASE_URL}/${collectionId}/recipes/cursor?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Error fetch collection recipes cursor");
    return res.json();
};
