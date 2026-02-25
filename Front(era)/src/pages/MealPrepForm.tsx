import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createMealPrep } from "../api/mealPrepApi";
import {fetchRecipesPage} from "../api/recipeApi";
import { Recipe } from "../types/Recipe";
import { MealPrepRequestDTO } from "../types/MealPrep";
import StyledTextField from "../components/StyledTextField";

const MealPrepForm: React.FC = () => {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState("");
    const [publicMealPrep, setPublicMealPrep] = useState(true);
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [selectedRecipeIds, setSelectedRecipeIds] = useState<number[]>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchRecipesPage(0, 200)           // trae hasta 200 recetas públicas
            .then(page => setRecipes(page.content))
            .catch(() => console.error("No se pudieron cargar las recetas"));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const token = localStorage.getItem("token") || "";
        const dto: MealPrepRequestDTO = {
            name,
            description,
            image,
            publicMealPrep,
            recipeIds: selectedRecipeIds,
        };

        await createMealPrep(dto, token);
        navigate("/me/my-mealpreps");
    };

    const handleImageSelect = (file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            setImage(base64);
        };
        reader.readAsDataURL(file);
    };

    const onFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        const file = e.target.files?.[0];
        if (file) handleImageSelect(file);
    };

    const triggerSelect = () => fileInputRef.current?.click();

    return (
        <>
            {/* Header flotante */}
            <div className="recipe-form-header">
                <button
                    type="button"
                    className="back-button"
                    onClick={() => navigate('/home')}
                >
                    ×
                </button>

                <button
                    type="submit"
                    form="mealprep-form"
                    className="create-button"
                    disabled={!image}
                    title={!image ? "Debes agregar una imagen" : undefined}
                >
                    Crear
                </button>
            </div>

            <form id="mealprep-form" className="recipe-form" onSubmit={handleSubmit}>
                {/* Hero de imagen */}
                <div className="image-upload" onClick={triggerSelect}>
                    {image ? (
                        <img src={image} alt="preview" className="image-preview" />
                    ) : (
                        <>
                            <p className="image-helper">Agregá una imagen de tu Meal Prep</p>
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
                <StyledTextField
                    label="Título"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <StyledTextField
                    label="Descripción"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />

                {/* Recipes section */}
                <div className="ingredients-section">
                    <h4 style={{
                        fontFamily: 'Albert Sans, sans-serif',
                        fontSize: '1.5rem',
                        fontWeight: 700
                    }}>Recetas para incluir</h4>

                    {recipes.map(recipe => (
                        <div key={recipe.id} className="ingredient-row">
                            <input
                                type="checkbox"
                                checked={selectedRecipeIds.includes(recipe.id)}
                                onChange={() => {
                                    setSelectedRecipeIds(prev =>
                                        prev.includes(recipe.id)
                                            ? prev.filter(id => id !== recipe.id)
                                            : [...prev, recipe.id]
                                    );
                                }}
                                style={{ marginRight: '0.5rem' }}
                            />
                            <input
                                type="text"
                                value={recipe.name}
                                disabled
                                className="ingredient-input"
                            />
                        </div>
                    ))}
                </div>

                {/* Visibility */}
                <div className="visibility-card">
                    <div className="visibility-header">
                        <h4 className="visibility-title">¿Querés que tu Meal Prep sea público?</h4>
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={publicMealPrep}
                                onChange={e => setPublicMealPrep(e.target.checked)}
                            />
                            <span className="slider"></span>
                        </label>
                    </div>
                    <p className="visibility-text">
                        {publicMealPrep ? "Este Meal Prep será público." : "Este Meal Prep será privado."}
                    </p>
                </div>
            </form>
        </>
    );
};

export default MealPrepForm;
