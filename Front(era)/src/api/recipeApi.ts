import { Recipe } from "../types/Recipe";
import { Page, PagedResponse } from "../types/Page";
import { getAuthHeaders } from "./config";

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

export async function fetchRecipesCursorPage(
    cursor: string | null,
    limit = 3
): Promise<PagedResponse<Recipe>> {
    const params = new URLSearchParams({ limit: String(limit) });
    if (cursor !== null) params.set("cursor", cursor);

    const res = await fetch(`${BASE_URL}/api/recipes/cursor?${params.toString()}`, {
        headers: getAuthHeaders(),
    });
    if (res.status === 404) {
        throw new Error("Endpoint /api/recipes/cursor no encontrado (ver backend)");
    }
    if (!res.ok) throw new Error("Error fetch recipes cursor");
    return res.json();
}

export async function fetchMyRecipesPage(
    page = 0,
    size = 6,
    token: string
): Promise<Page<Recipe>> {
    const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";
    const res = await fetch(
        `${BASE_URL}/api/users/me/recipes?page=${page}&size=${size}`,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) throw new Error("Error fetch my recipes");
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

export async function searchRecipesCursor(
    filters: {
        name?: string;
        ingredient?: string;
        author?: string;
        onlyFollowing?: boolean;
        excludeUndesired?: boolean;
    },
    cursor: string | null,
    limit = 6
): Promise<PagedResponse<Recipe>> {
    const params = new URLSearchParams();
    if (filters.name) params.set("name", filters.name);
    if (filters.ingredient) params.set("ingredient", filters.ingredient);
    if (filters.author) params.set("author", filters.author);
    if (typeof filters.onlyFollowing === "boolean") params.set("onlyFollowing", String(filters.onlyFollowing));
    if (typeof filters.excludeUndesired === "boolean") params.set("excludeUndesired", String(filters.excludeUndesired));
    params.set("limit", String(limit));
    if (cursor !== null) params.set("cursor", cursor);

    const res = await fetch(`${BASE_URL}/api/recipes/search/cursor?${params.toString()}`, {
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Error search recipes cursor");
    return res.json();
}

export async function downloadRecipePdf(id: number): Promise<Blob> {
    const res = await fetch(`${BASE_URL}/api/recipes/${id}/pdf`, {
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("No se pudo exportar el PDF de la receta");
    return res.blob();
}
