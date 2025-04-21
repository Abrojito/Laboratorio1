import '../styles/RecipeForm.css';
import React, { useState, FormEvent, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {AUTH_URL} from "../api/config.ts";

interface RecipeRequestDTO {
    name: string;
    description: string;
    image: string; // base64 o URL
    category: string;
    author: string;
    //userId: number;
    time: string;
    ingredientIds: number[];
}

const NewRecipeForm: React.FC  = () => {
    const navigate = useNavigate();
    const [recipe, setRecipe] = useState<RecipeRequestDTO>({
        name: '',
        description: '',
        image: '',
        category: '',
        author: '',
        //userId: 1,
        time: '',
        ingredientIds: [],
    });

    //const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [newIngredient, setNewIngredient] = useState<string>('');
    const [newIngredientList, setNewIngredientList] = useState<string[]>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    /* --- foto ---------------------------------------------------------------- */
    const handleImageSelect = (file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            setRecipe((prev) => ({ ...prev, image: base64 }));
        };
        reader.readAsDataURL(file);
    };

    const onFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        const file = e.target.files?.[0];
        if (file) handleImageSelect(file);
    };

    const triggerSelect = () => fileInputRef.current?.click();

    const handleAddIngredient = async () => {
        const response = await fetch(`http://localhost:8080/ingredients`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: 0, name: newIngredient }),
        });

        if (!response.ok) {
            throw new Error('Invalid ingredient');
        }
        const data = await response.json();
        const newIngredientId = data.id;

        if (!recipe.ingredientIds.includes(newIngredientId)) {
            setRecipe({
                ...recipe,
                ingredientIds: [...recipe.ingredientIds, newIngredientId],
            });
            setNewIngredientList((prev) => [...prev, newIngredient]);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            // 1. Obtén el token del localStorage
            const token = localStorage.getItem('token');

            // 2. Llama al endpoint incluyendo el header Authorization si hay token
            const response = await fetch('http://localhost:8080/api/recipes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(recipe),
            });

            // 3. Manejo de errores
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText);
            }

            // 4. Navega a /home una vez creada la receta
            navigate('/home');
        } catch (err: any) {
            alert('Error creando receta: ' + err.message);
        }
    };

    return (

        <form className="recipe-form" onSubmit={handleSubmit}>
            {/* ───────── Hero de imagen ───────── */}
            <div className="image-upload" onClick={triggerSelect}>
                {recipe.image ? (
                    <img src={recipe.image} alt="preview" className="image-preview" />
                ) : (
                    <>
                        <span className="camera-icon" />
                        <p className="image-helper">Add a picture of your recipe</p>
                    </>
                )}
                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={onFileChange}
                    hidden
                />
            </div>

            {/* Campos básicos */}
            <input
                placeholder="Title"
                value={recipe.name}
                onChange={(e) => setRecipe({ ...recipe, name: e.target.value })}
            />
            <textarea
                placeholder="Description"
                value={recipe.description}
                onChange={(e) => setRecipe({ ...recipe, description: e.target.value })}
            />
            <input
                placeholder="Category"
                value={recipe.category}
                onChange={(e) => setRecipe({ ...recipe, category: e.target.value })}
            />

            <input
                placeholder="Time of duration"
                value={recipe.time}
                onChange={(e) => setRecipe({ ...recipe, time: e.target.value })}
            />

            {/* Ingredientes */}
            <div>
                <h4>Ingredients</h4>

                <input
                    type="name"
                    placeholder="Ingredient"
                    value={newIngredient || ''}
                    onChange={(e) => setNewIngredient(e.target.value)}
                />
                <button type="button" onClick={handleAddIngredient}>+ Add ingredient</button>
                <button type="button" onClick={handleAddIngredient}>+ Add Group</button>

                <ul>
                    {newIngredientList.map((name, i) => (
                        <li key={i}>Name: {name}</li>
                    ))}
                </ul>

            </div>

            <button type="btn-primar">Create</button>
        </form>
    );
};

export default NewRecipeForm;
