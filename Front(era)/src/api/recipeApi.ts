import { Recipe } from "../types/Recipe";
import { Page } from "../types/Page";

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

export async function fetchRecipes(token?: string): Promise<Recipe[]> {
    const res = await fetch(`${BASE_URL}/api/recipes`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error('Error fetching recipes');

    /** Si el back devolvió 204 o no-JSON, regresamos lista vacía */
    const ct = res.headers.get('Content-Type') ?? '';
    if (!ct.includes('application/json')) return [];

    return res.json() as Promise<Recipe[]>;
}

export async function fetchRecipesPage(page = 0, size = 3): Promise<Page<Recipe>> {
    const res = await fetch(`${BASE_URL}/api/recipes?page=${page}&size=${size}`);
    if (!res.ok) throw new Error("Error fetch recipes");
    return res.json();
}

export async function searchRecipes(filters: {
    name?: string;
    ingredient?: string;
    author?: string;
}): Promise<Recipe[]> {
    const query = new URLSearchParams(filters as any).toString();
    const res = await fetch(`http://localhost:8080/api/recipes/search?${query}`);
    return await res.json();
}

