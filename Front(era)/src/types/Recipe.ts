export interface IngredientWithQuantity {
    ingredientId: number;
    quantity: string;
}

export interface Review {
    id: number;
    comment: string;
    rating: number;
    username: string;
    userPhoto: string;
    createdAt: string;
}

export interface Recipe {
    id: number;
    name: string;
    description: string;
    image: string;
    category: string;
    author: string;
    authorPhoto: string;
    userId: number;
    time: string;
    ingredients: IngredientWithQuantity[];
    steps: string[];
    reviews: Review[];
}
