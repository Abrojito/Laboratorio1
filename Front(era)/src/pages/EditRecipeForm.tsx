import React, { useEffect, useState, useRef, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/RecipeForm.css';

interface IngredientName {
    id: number;
    name: string;
}

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
    const fileInputRef = useRef<HTMLInputElement>(null);
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
    const [ingredientNames, setIngredientNames] = useState<IngredientName[]>([]);
    const [newIngredient, setNewIngredient] = useState('');
    const [newIngredientQuantity, setNewIngredientQuantity] = useState('');
    const [newGroupName, setNewGroupName] = useState('');
    const [showGroupInput, setShowGroupInput] = useState(false);
    const [stepsList, setStepsList] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
    const stepImageInputRefs = useRef<HTMLInputElement[]>([]);
    const [stepImages, setStepImages] = useState<Record<number, string[]>>({});

    useEffect(() => {
        const fetchRecipe = async () => {
            const res = await fetch(`http://localhost:8080/api/recipes/${id}`);
            const data = await res.json();

            console.log('Ingredientes:', data.ingredients);

            const ingMap = new Map<number, string>();
            data.ingredients.forEach((ing: { ingredientId: number; quantity: string; name: string }) => {
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
            setIngredientNames(data.ingredients.map((ing: any) => ({ id: ing.ingredientId, name: ing.name })));
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

    const handleAddStep = () => {
        setStepsList([...stepsList, '']);
    };

    const handleRemoveStep = (index: number) => {
        const newSteps = stepsList.filter((_, i) => i !== index);
        setStepsList(newSteps);
    };

    const toggleMenu = (index: number) => {
        setOpenMenuIndex(openMenuIndex === index ? null : index);
    };

    const handleStepImageChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const files = e.target.files;
        if (!files) return;

        const readers = Array.from(files).map((file) => {
            return new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(file);
            });
        });

        Promise.all(readers).then((base64s) => {
            setStepImages((prev) => ({ ...prev, [index]: [...(prev[index] || []), ...base64s] }));
        });
    };

    const handleAddImageToStep = (index: number) => {
        stepImageInputRefs.current[index]?.click();
        setOpenMenuIndex(null);
    };

    const handleIngredientQuantityChange = (ingredientId: number, quantity: string) => {
        const updated = new Map(recipe.ingredientIds);
        updated.set(ingredientId, quantity);
        setRecipe({ ...recipe, ingredientIds: updated });
    };

    const handleRemoveIngredient = (ingredientId: number) => {
        const updated = new Map(recipe.ingredientIds);
        updated.delete(ingredientId);
        setRecipe({ ...recipe, ingredientIds: updated });
        setIngredientNames((prev) => prev.filter((ing) => ing.id !== ingredientId));
    };

    const handleAddIngredient = () => {
        if (!newIngredient || !newIngredientQuantity) return;
        const newId = Math.floor(Math.random() * 1000000);
        const updated = new Map(recipe.ingredientIds);
        updated.set(newId, newIngredientQuantity);
        setRecipe({ ...recipe, ingredientIds: updated });
        setIngredientNames((prev) => [...prev, { id: newId, name: newIngredient }]);
        setNewIngredient('');
        setNewIngredientQuantity('');
    };

    const handleAddGroup = () => {
        setShowGroupInput(true);
    };

    return (
        <>
            <div className="recipe-form-header">
                <button
                    type="button"
                    className="back-button"
                    onClick={() => navigate('/me/myrecipes')}
                >
                    ×
                </button>
                <button
                    type="submit"
                    form="recipe-form"
                    className="create-button"
                    disabled={!recipe.image}
                    title={!recipe.image ? "You must add a picture" : undefined}
                >
                    Save
                </button>
            </div>

            <form id="recipe-form" className="recipe-form" onSubmit={handleSubmit}>
                <div className="image-upload" onClick={() => fileInputRef.current?.click()}>
                    {recipe.image ? (
                        <img src={recipe.image} alt="preview" className="image-preview" />
                    ) : (
                        <p className="image-helper">Add a picture of your recipe</p>
                    )}
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={(e) => e.target.files?.[0] && handleImageSelect(e.target.files[0])}
                        hidden
                    />
                </div>

                <input
                    className="input"
                    placeholder="Title"
                    value={recipe.name}
                    onChange={(e) => setRecipe({ ...recipe, name: e.target.value })}
                    required
                />
                <textarea
                    className="textarea"
                    placeholder="Description"
                    value={recipe.description}
                    onChange={(e) => setRecipe({ ...recipe, description: e.target.value })}
                    required
                />
                <input
                    className="input"
                    placeholder="Time"
                    value={recipe.time}
                    onChange={(e) => setRecipe({ ...recipe, time: e.target.value })}
                    required
                />

                <div className="ingredients-section">
                    <h4 className="h4">Ingredients</h4>
                    <div className="ingredient-inputs-row">
                        <input
                            className="ingredient-input"
                            placeholder="Ingredient"
                            value={newIngredient}
                            onChange={(e) => setNewIngredient(e.target.value)}
                            style={{ flex: 2, marginRight: '1rem' }}
                        />
                        <input
                            className="ingredient-qty"
                            placeholder="Quantity"
                            value={newIngredientQuantity}
                            onChange={(e) => setNewIngredientQuantity(e.target.value)}
                            style={{ flex: 1 }}
                        />
                    </div>

                    {ingredientNames.map((item) => (
                        <div key={item.id} className="ingredient-row">
                            <input
                                type="text"
                                className="ingredient-qty"
                                placeholder="Ej: 2g"
                                value={recipe.ingredientIds.get(item.id) || ''}
                                onChange={(e) => handleIngredientQuantityChange(item.id, e.target.value)}
                            />
                            <input
                                type="text"
                                value={item.name}
                                disabled
                                className="ingredient-input"
                            />
                            <button
                                className="delete-ingredient"
                                type="button"
                                onClick={() => handleRemoveIngredient(item.id)}
                            >
                                ⋯
                            </button>
                        </div>
                    ))}
                    <div className="buttons-container">
                        <button type="button" className="add-button" onClick={handleAddIngredient}>
                            + Add ingredient
                        </button>
                        <button type="button" className="add-button" onClick={handleAddGroup}>
                            + Add Group
                        </button>
                    </div>

                    {showGroupInput && (
                        <div className="group-input-container">
                            <input
                                className="input"
                                placeholder="Group name"
                                value={newGroupName}
                                onChange={(e) => setNewGroupName(e.target.value)}
                            />
                            <button
                                type="button"
                                className="create-group-button"
                                onClick={() => {/* lógica futura */}}
                            >
                                Create group
                            </button>
                        </div>
                    )}
                </div>

                <div className="steps-section">
                    <h4 className="h4">Steps</h4>
                    {stepsList.map((step, index) => (
                        <div key={index} className="step-card">
                            <div className="step-header">
                                <div className="step-number">{index + 1}</div>
                                <input
                                    className="step-input"
                                    type="text"
                                    placeholder="Ex: Mix the eggs with the milk..."
                                    value={step}
                                    onChange={(e) => {
                                        const newSteps = [...stepsList];
                                        newSteps[index] = e.target.value;
                                        setStepsList(newSteps);
                                    }}
                                />
                                <div className="step-menu-container">
                                    <button type="button" className="menu-btn" onClick={() => toggleMenu(index)}>
                                        ⋯
                                    </button>
                                    {openMenuIndex === index && (
                                        <div className="menu-dropdown">
                                            <button type="button" onClick={() => handleAddImageToStep(index)}>
                                                Add picture
                                            </button>
                                            <button type="button" onClick={() => handleRemoveStep(index)}>
                                                Delete step
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="step-images">
                                {stepImages[index]?.map((img, i) => (
                                    <img
                                        key={i}
                                        src={img}
                                        alt={`Step ${index + 1} - img ${i + 1}`}
                                        className="step-thumbnail"
                                    />
                                ))}
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                style={{ display: 'none' }}
                                ref={(el) => (stepImageInputRefs.current[index] = el)}
                                onChange={(e) => handleStepImageChange(e, index)}
                            />
                        </div>
                    ))}
                    <div className="buttons-container">
                        <button type="button" className="add-button" onClick={handleAddStep}>
                            + Add Step
                        </button>
                    </div>
                </div>

                <div className="visibility-card">
                    <div className="visibility-header">
                        <h4 className="visibility-title">Do you want your recipe to be public?</h4>
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={recipe.publicRecipe}
                                onChange={e => setRecipe({ ...recipe, publicRecipe: e.target.checked })}
                            />
                            <span className="slider"></span>
                        </label>
                    </div>
                    <p className="visibility-text">
                        {recipe.publicRecipe ? "This recipe will be public." : "This recipe will be private."}
                    </p>
                </div>

                {error && <div className="error-message">{error}</div>}
            </form>
        </>
    );
};

export default EditRecipeForm;
