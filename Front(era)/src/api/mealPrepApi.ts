const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

import { MealPrep, MealPrepRequestDTO } from "../types/MealPrep";

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

