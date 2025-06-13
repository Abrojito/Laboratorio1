export interface RecipeSummary {
    id: number;
    name: string;
    image: string;
}

export interface Review {
    id: number;
    comment: string;
    rating: number;
    username: string;
    userPhoto: string;
    createdAt: string;
}

export interface MealPrep {
    id: number;
    name: string;
    description: string;
    image: string;
    author: string;
    authorPhoto: string;
    userId: number;
    publicMealPrep: boolean;
    recipes: RecipeSummary[];
    reviews: Review[];
}

export interface MealPrepRequestDTO {
    name: string;
    description: string;
    image: string;
    publicMealPrep: boolean;
    recipeIds: number[];
}
