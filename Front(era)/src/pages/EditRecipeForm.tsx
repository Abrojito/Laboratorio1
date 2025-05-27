import React, { useEffect, useState, useRef, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/RecipeForm.css';

interface RecipeRequestDTO {
    name: string;
    description: string;
    image: string;
    category: string;
    author: string;
    time: string;
    ingredientIds: Map<number, string>;
    steps: string[];
    publicRecipe: boolean;
}

const EditRecipeForm: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [recipe, setRecipe] = useState<RecipeRequestDTO>({
        name: '',
        description: '',
        image: '',
        category: '',
        author: '',
        time: '',
        ingredientIds: new Map<number, string>(),
        steps: [],
        publicRecipe: true,
    });
    const [stepsList, setStepsList] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchRecipe = async () => {
            const res = await fetch(`http://localhost:8080/api/recipes/${id}`);
            const data = await res.json();

            const ingMap = new Map<number, string>();
            data.ingredients.forEach((ing: { ingredientId: number; quantity: string }) => {
                ingMap.set(ing.ingredientId, ing.quantity);
            });

            setRecipe({
                name: data.name,
                description: data.description,
                image: data.image,
                category: data.category,
                author: data.author,
                time: data.time,
                ingredientIds: ingMap,
                steps: data.steps,
                publicRecipe: data.publicRecipe,
            });
            setStepsList(data.steps);
        };

        if (id) fetchRecipe();
    }, [id]);

    const handleImageSelect = (file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            setRecipe((prev) => ({ ...prev, image: base64 }));
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        const payload = {
            ...recipe,
            steps: stepsList,
            ingredientIds: Object.fromEntries(recipe.ingredientIds),

        };
        console.log('Payload enviado:', payload);
        console.log('TOKEN QUE SE ENVÍA:', token);

        const res = await fetch(`http://localhost:8080/api/recipes/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const error = await res.text();
            setError('Error actualizando receta: ' + error);
            return;
        }

        navigate('/me/myrecipes');
    };

    return (
        <div className="recipe-form-container">
            <h2>Editar Receta</h2>
            <form className="recipe-form" onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Nombre"
                    value={recipe.name}
                    onChange={(e) => setRecipe({ ...recipe, name: e.target.value })}
                    required
                />
                <textarea
                    placeholder="Descripción"
                    value={recipe.description}
                    onChange={(e) => setRecipe({ ...recipe, description: e.target.value })}
                    rows={4}
                    required
                />
                <input
                    type="text"
                    placeholder="Categoría"
                    value={recipe.category}
                    onChange={(e) => setRecipe({ ...recipe, category: e.target.value })}
                    required
                />
                <input
                    type="text"
                    placeholder="Autor"
                    value={recipe.author}
                    onChange={(e) => setRecipe({ ...recipe, author: e.target.value })}
                    required
                />
                <input
                    type="text"
                    placeholder="Tiempo"
                    value={recipe.time}
                    onChange={(e) => setRecipe({ ...recipe, time: e.target.value })}
                    required
                />
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => e.target.files?.[0] && handleImageSelect(e.target.files[0])}
                />

                {stepsList.map((step, idx) => (
                    <input
                        key={idx}
                        type="text"
                        placeholder={`Paso ${idx + 1}`}
                        value={step}
                        onChange={(e) => {
                            const newSteps = [...stepsList];
                            newSteps[idx] = e.target.value;
                            setStepsList(newSteps);
                        }}
                        required
                    />
                ))}
                <button type="button" className="add-step-button" onClick={() => setStepsList([...stepsList, ''])}>
                    ➕ Agregar paso
                </button>

                {error && <div className="error-message">{error}</div>}

                <button type="submit" className="submit-button">
                    💾 Guardar cambios
                </button>
            </form>
        </div>
    );
};

export default EditRecipeForm;
