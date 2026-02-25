import React, { useEffect, useState, useRef, FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchRecipes } from "../api/recipeApi";
import { fetchMealPrep } from "../api/mealPrepApi";
import { MealPrepRequestDTO } from "../types/MealPrep";
import { Recipe } from "../types/Recipe";
import StyledTextField from "../components/StyledTextField";

const EditMealPrepForm: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState("");
    const [publicMealPrep, setPublicMealPrep] = useState(true);
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [selectedRecipeIds, setSelectedRecipeIds] = useState<number[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            try {
                const mealPrep = await fetchMealPrep(Number(id));
                const allRecipes = await fetchRecipes();

                setName(mealPrep.name);
                setDescription(mealPrep.description);
                setImage(mealPrep.image);
                setPublicMealPrep(mealPrep.publicMealPrep);
                setSelectedRecipeIds(mealPrep.recipes.map(r => r.id));

                setRecipes(allRecipes);
            } catch (err) {
                console.error(err);
                setError("Error cargando Meal Prep.");
            }
        };

        fetchData();
    }, [id]);

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

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        const token = localStorage.getItem("token") || "";

        const payload: MealPrepRequestDTO = {
            name,
            description,
            image,
            publicMealPrep,
            recipeIds: selectedRecipeIds,
        };

        const res = await fetch(`http://localhost:8080/api/mealpreps/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const error = await res.text();
            setError("Error actualizando Meal Prep: " + error);
            return;
        }

        navigate("/me/my-mealpreps");
    };

    return (
        <>
            <div className="recipe-form-header">
                <button
                    type="button"
                    className="back-button"
                    onClick={() => navigate(-1)}
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
                    Guardar
                </button>
            </div>

            <form id="mealprep-form" className="recipe-form" onSubmit={handleSubmit}>
                <div className="image-upload" onClick={triggerSelect}>
                    {image ? (
                        <img src={image} alt="preview" className="image-preview" />
                    ) : (
                        <p className="image-helper">Agregá una imagen de tu Meal Prep</p>
                    )}
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={onFileChange}
                        hidden
                    />
                </div>

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

                {error && <div className="error-message">{error}</div>}
            </form>
        </>
    );
};

export default EditMealPrepForm;
