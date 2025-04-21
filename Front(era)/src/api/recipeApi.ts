export interface Recipe {
    id: number;
    name: string;
    description: string;
    image: string | null;
    category: string;
    author: string;
    userId: number;
    difficulty: string;
}

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

export async function fetchRecipes(token?: string): Promise<Recipe[]> {
    const res = await fetch(`${BASE_URL}/api/recipes`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error('Error fetching recipes');
    return res.json();
}
