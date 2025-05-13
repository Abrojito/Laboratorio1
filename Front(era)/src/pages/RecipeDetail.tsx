import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Recipe } from "../api/recipeApi";
import BackButton from "../components/BackButton.tsx"; // el tipo que ya usás

const RecipeDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [ingredientNames, setIngredientNames] = useState<Record<number, string>>({});


    useEffect(() => {
        if (!id) return;

        async function fetchRecipeAndIngredients() {
            try {
                const res = await fetch(`http://localhost:8080/api/recipes/${id}`);
                const data = await res.json();
                setRecipe(data);

                const ingRes = await fetch("http://localhost:8080/ingredients");
                const allIngredients = await ingRes.json(); // [{ id, name }]

                const nameMap: Record<number, string> = {};
                allIngredients.forEach((ing: any) => {
                    nameMap[ing.id] = ing.name;
                });

                setIngredientNames(nameMap);
            } catch (err) {
                setError("Error cargando receta");
            }
        }

        fetchRecipeAndIngredients();
    }, [id]);


    if (error) return <div>{error}</div>;
    if (!recipe) return <div>Cargando receta...</div>;

    return (
        <div>
            <BackButton />
        <div style={{ padding: '2rem' }}>
            <h1>{recipe.name}</h1>
            <img src={recipe.image || "/default-recipe.png"} alt={recipe.name} style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '8px' }} />
            <p>{recipe.description}</p>
            {recipe.ingredients.length > 0 && (
                <div style={{ marginTop: '2rem' }}>
                    <h3>Ingredients</h3>
                    <ul>
                        {recipe.ingredients.map((ing) => (
                            <li key={ing.ingredientId}>
                                {ingredientNames[ing.ingredientId] || `ID ${ing.ingredientId}`}: {ing.quantity}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            <p><strong>Categoría:</strong> {recipe.category}</p>
            <p><strong>Dificultad:</strong> {recipe.difficulty}</p>
            {recipe.steps.length > 0 && (
                <div style={{ marginTop: '2rem' }}>
                    <h3>Steps</h3>
                    <ol>
                        {recipe.steps.map((step, index) => (
                            <li key={index} style={{ marginBottom: '1rem' }}>
                                {step}
                            </li>
                        ))}
                    </ol>
                </div>
            )}
        </div>
        </div>
    );
};

export default RecipeDetail;
