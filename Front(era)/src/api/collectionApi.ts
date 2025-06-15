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
