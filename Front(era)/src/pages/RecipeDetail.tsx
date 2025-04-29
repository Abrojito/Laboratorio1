import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Recipe } from "../api/recipeApi";
import BackButton from "../components/BackButton.tsx"; // el tipo que ya usás

const RecipeDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        fetch(`http://localhost:8080/api/recipes/${id}`)
            .then(res => res.json())
            .then(data => setRecipe(data))
            .catch(err => setError("Error cargando receta"));
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
            <p><strong>Categoría:</strong> {recipe.category}</p>
            <p><strong>Dificultad:</strong> {recipe.difficulty}</p>
            {/* Si querés también mostrar autor, pasos, etc */}
        </div>
        </div>
    );
};

export default RecipeDetail;
