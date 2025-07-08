export interface IngredientWithQuantity {
    ingredientId: number;
    quantity: string;
}

export interface Review {
    id: number;
    comment: string;
    rating: number;
    username: string;
    userId: number;
    userPhoto: string;
    createdAt: string;
}

export interface Recipe {
    id: number;
    name: string;
    description: string;
    image: string | null;
    category: string;
    author: string;
    authorPhoto?: string;
    userId: number;
    time?: string;
    difficulty?: string;
    creatorUsername?: string;
    steps?: string[];
    ingredients: { ingredientId: number; quantity: string }[];
    reviews?: Review[];
    avgRating: number;
    reviewCount: number;
}

export interface RecipeSearchResult {
    id: number;
    name: string;
    image: string;
    description?: string;
    author?: string;
    authorPhoto?: string;
    time?: string;
    reviews?: any[];
}
