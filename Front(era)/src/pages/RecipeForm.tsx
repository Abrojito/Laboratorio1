import React, { useState, FormEvent, useRef } from 'react';
import '../styles/RecipeForm.css';

interface RecipeRequestDTO {
    name: string;
    description: string;
    image: string; // base64 o URL
    category: string;
    author: string;
    //userId: number;
    difficulty: string;
    ingredientIds: number[];
}

const NewRecipeForm: React.FC  = () => {
    const [recipe, setRecipe] = useState<RecipeRequestDTO>({
        name: '',
        description: '',
        image: '',
        category: '',
        author: '',
        //userId: 1,
        difficulty: '',
        ingredientIds: [],
    });

    //const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [newIngredientId, setNewIngredientId] = useState<number>(0);

   /* const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setRecipe({ ...recipe, image: base64 });
                setImagePreview(base64);
            };
            reader.readAsDataURL(file);
        }
    };*/
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

    const handleAddIngredient = () => {
        if (!recipe.ingredientIds.includes(newIngredientId) && newIngredientId > 0) {
            setRecipe({
                ...recipe,
                ingredientIds: [...recipe.ingredientIds, newIngredientId],
            });
            setNewIngredientId(0);
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        console.log('Receta lista para enviar:', recipe);
        // Acá harías tu POST al backend
    };

    return (
       /* <form onSubmit={handleSubmit} className="recipe-form">
            {/!* Imagen *!/}
            <label>
                Foto:
                <input type="file" accept="image/!*" onChange={handleImageChange} />
            </label>
            {imagePreview && <img src={imagePreview} alt="preview" width={200} />}
*/
        <form className="recipe-form" onSubmit={handleSubmit}>
            {/* ───────── Hero de imagen ───────── */}
            <div className="image-upload" onClick={triggerSelect}>
                {recipe.image ? (
                    <img src={recipe.image} alt="preview" className="image-preview" />
                ) : (
                    <>
                        <span className="camera-icon" />
                        <p className="image-helper">Añade una foto de tu receta</p>
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
                placeholder="Título"
                value={recipe.name}
                onChange={(e) => setRecipe({ ...recipe, name: e.target.value })}
            />
            <textarea
                placeholder="Descripción"
                value={recipe.description}
                onChange={(e) => setRecipe({ ...recipe, description: e.target.value })}
            />
            <input
                placeholder="Categoría"
                value={recipe.category}
                onChange={(e) => setRecipe({ ...recipe, category: e.target.value })}
            />

            <input
                placeholder="Dificultad"
                value={recipe.difficulty}
                onChange={(e) => setRecipe({ ...recipe, difficulty: e.target.value })}
            />

            {/* Ingredientes */}
            <div>
                <h4>IDs de ingredientes</h4>
                <ul>
                    {recipe.ingredientIds.map((id, i) => (
                        <li key={i}>ID: {id}</li>
                    ))}
                </ul>
                <input
                    type="number"
                    placeholder="Ingrediente"
                    value={newIngredientId || ''}
                    onChange={(e) => setNewIngredientId(parseInt(e.target.value))}
                />
                <button type="button" onClick={handleAddIngredient}>+ Agregar ingrediente</button>
                <button type="button" onClick={handleAddIngredient}>+ Agregar Grupo</button>
            </div>

            <button type="btn-primar">Crear receta</button>
        </form>
    );
};

export default NewRecipeForm;
