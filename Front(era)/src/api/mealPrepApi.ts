const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

import { MealPrep, MealPrepRequestDTO } from "../types/MealPrep";
import { Page, PagedResponse } from "../types/Page";
import { getAuthHeaders } from "./config";

export async function fetchMealPreps(): Promise<MealPrep[]> {
    const res = await fetch(`${BASE_URL}/api/mealpreps`);
    if (!res.ok) throw new Error('Error fetching mealpreps');
    return res.json();
}

export async function fetchMealPrep(id: number): Promise<MealPrep> {
    const res = await fetch(`${BASE_URL}/api/mealpreps/${id}`);
    if (!res.ok) throw new Error('Error fetching mealprep');
    return res.json();
}

export async function fetchMealPrepsPage(page = 0, size = 3): Promise<Page<MealPrep>> {
    const res = await fetch(`${BASE_URL}/api/mealpreps?page=${page}&size=${size}`);
    if (!res.ok) throw new Error("Error fetch meal preps");
    return res.json();
}

export async function fetchMealPrepsCursorPage(
    cursor: string | null,
    limit = 3
): Promise<PagedResponse<MealPrep>> {
    const params = new URLSearchParams({ limit: String(limit) });
    if (cursor !== null) params.set("cursor", cursor);

    const res = await fetch(`${BASE_URL}/api/mealpreps/cursor?${params.toString()}`, {
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Error fetch meal preps cursor");
    return res.json();
}

export async function fetchMyMealPreps(token: string): Promise<MealPrep[]> {
    const res = await fetch(`${BASE_URL}/api/users/me/mealpreps`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    if (!res.ok) throw new Error('Error fetching my meal preps');

    const ct = res.headers.get('Content-Type') ?? '';
    if (!ct.includes('application/json')) return [];

    return res.json() as Promise<MealPrep[]>;
}


export async function createMealPrep(dto: MealPrepRequestDTO, token: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/api/mealpreps`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dto),
    });
    if (!res.ok) throw new Error('Error creating mealprep');
}

export async function deleteMealPrep(id: number, token: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/api/mealpreps/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    if (!res.ok) throw new Error('Error deleting mealprep');
}

export async function createMealPrepReview(mealPrepId: number, dto: { comment: string; rating: number; username: string; }, token: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/api/mealpreps/${mealPrepId}/reviews`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dto),
    });
    if (!res.ok) throw new Error('Error creating mealprep review');
}

export async function searchMealPreps(filters: {
    name?: string;
    ingredient?: string;
    author?: string;
}): Promise<MealPrep[]> {
    const query = new URLSearchParams(filters as any).toString();
    const res = await fetch(`http://localhost:8080/api/mealpreps/search?${query}`);
    return await res.json();
}

export async function searchMealPrepsCursor(
    filters: {
        name?: string;
        ingredient?: string;
        author?: string;
        onlyFollowing?: boolean;
        excludeUndesired?: boolean;
    },
    cursor: string | null,
    limit = 6
): Promise<PagedResponse<MealPrep>> {
    const params = new URLSearchParams();
    if (filters.name) params.set("name", filters.name);
    if (filters.ingredient) params.set("ingredient", filters.ingredient);
    if (filters.author) params.set("author", filters.author);
    if (typeof filters.onlyFollowing === "boolean") params.set("onlyFollowing", String(filters.onlyFollowing));
    if (typeof filters.excludeUndesired === "boolean") params.set("excludeUndesired", String(filters.excludeUndesired));
    params.set("limit", String(limit));
    if (cursor !== null) params.set("cursor", cursor);

    const res = await fetch(`${BASE_URL}/api/mealpreps/search/cursor?${params.toString()}`, {
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Error search meal preps cursor");
    return res.json();
}

export async function fetchMyMealPrepsPage(
    page = 0,
    size = 6,
    token: string
): Promise<Page<MealPrep>> {
    const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";
    const res = await fetch(
        `${BASE_URL}/api/users/me/mealpreps?page=${page}&size=${size}`,
        {
            headers: { Authorization: `Bearer ${token}` },
        }
    );
    if (!res.ok) throw new Error("Error fetch my meal preps");
    return res.json();
}

export async function downloadMealPrepPdf(id: number): Promise<Blob> {
    const res = await fetch(`${BASE_URL}/api/mealpreps/${id}/pdf`, {
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("No se pudo exportar el PDF del meal prep");
    return res.blob();
}
