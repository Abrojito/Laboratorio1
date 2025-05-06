export interface Recipe {
    id: number;
    name: string;
    description: string;
    image: string | null;
    category: string;
    author: string;
    userId: number;
    difficulty: string;
    creatorUsername: string;
    steps: string[];
}

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
