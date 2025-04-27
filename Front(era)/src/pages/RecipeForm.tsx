import '../styles/RecipeForm.css';
import React, { useState, FormEvent, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import StyledTextField from "../components/StyledTextField";


interface RecipeRequestDTO {
    name: string;
    description: string;
    image: string; // base64 o URL
    category: string;
    author: string;
    //userId: number;
    time: string;
    ingredientIds: number[];
    steps: string[];
    isPublic: boolean;
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
        steps: [],
        isPublic: true,
    });


    const [stepsList, setStepsList] = useState<string[]>(['']);
    const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);


    //const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [newIngredient, setNewIngredient] = useState<string>('');
    //const [newIngredientList, setNewIngredientList] = useState<string[]>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const [stepImages, setStepImages] = useState<string[][]>([[]]);
    const stepImageInputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Nuevos estados para grupos de ingredientes
    const [showGroupInput, setShowGroupInput] = useState<boolean>(false);
    const [newGroupName, setNewGroupName] = useState<string>('');
    const [ingredientGroups, setIngredientGroups] = useState<IngredientGroup[]>([]);
    const [activeGroupIndex, setActiveGroupIndex] = useState<number | null>(null);

// Define la interfaz para grupos
    interface Ingredient {
        name: string;
        quantity?: string;
    }

    interface IngredientGroup {
        name: string;
        ingredients: Ingredient[];
    }



    /* --- foto ---------------------------------------------------------------- */
    const handleImageSelect = (file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            setRecipe((prev) => ({...prev, image: base64}));
        };
        reader.readAsDataURL(file);
    };

    const onFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        const file = e.target.files?.[0];
        if (file) handleImageSelect(file);
    };

    const triggerSelect = () => fileInputRef.current?.click();

    const handleAddIngredient = async () => {
        if (!newIngredient || newIngredient.trim() === '') {
            alert('Ingredient name cannot be empty');
            return;
        }

        try {
            let newIngredientId;

            const response = await fetch(`http://localhost:8080/ingredients`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: 0, name: newIngredient }),
            });

            if (response.ok) {
                const data = await response.json();
                newIngredientId = data.id;
            } else {
                // Si falla, asumimos que ya existe y lo buscamos por nombre
                const existing = await fetch(`http://localhost:8080/ingredients/search?name=${encodeURIComponent(newIngredient)}`);
                if (!existing.ok) throw new Error("Ingredient not found or error on fallback");
                const data = await existing.json();
                newIngredientId = data.id;
            }

            if (!recipe.ingredientIds.includes(newIngredientId)) {
                setRecipe((prev) => ({
                    ...prev,
                    ingredientIds: [...prev.ingredientIds, newIngredientId],
                }));
            }

            if (activeGroupIndex !== null) {
                const updatedGroups = [...ingredientGroups];
                updatedGroups[activeGroupIndex].ingredients.push({ name: newIngredient, quantity: '' });
                setIngredientGroups(updatedGroups);
            } else {
                setNewIngredientList((prev) => [...prev, { name: newIngredient, quantity: '' }]);
            }

            setNewIngredient('');
        } catch (error) {
            console.error('Error al añadir ingrediente:', error);
            alert('No se pudo añadir el ingrediente. Inténtalo de nuevo.');
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        try {
            const token   = localStorage.getItem('token');
            const userId  = Number(localStorage.getItem('userId'));   // <-- nuevo
            const email   = localStorage.getItem('email');            // (por si lo usás)

            const response = await fetch('http://localhost:8080/api/recipes', {
                method : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ ...recipe, userId }),             // <-- mando userId
            });

            if (!response.ok) {
                const err = await response.text();
                throw new Error(err || 'Error creando receta');
            }

            /* ✅ creada con éxito → al Home */
            navigate('/home');

        } catch (err: any) {
            alert('Error creando receta: ' + err.message);
        }
    };


    const handleStepChange = (index: number, value: string) => {
        const updated = [...stepsList];
        updated[index] = value;
        setStepsList(updated);
    };

    const handleAddStep = () => {
        setStepsList([...stepsList, '']);
        setStepImages([...stepImages, []]);
    };

    const toggleMenu = (index: number) => {
        setOpenMenuIndex(openMenuIndex === index ? null : index);
    };

    const handleRemoveStep = (index: number) => {
        const updated = [...stepsList];
        updated.splice(index, 1);
        setStepsList(updated);
        setOpenMenuIndex(null);
    };

    const handleAddImageToStep = (index: number) => {
        stepImageInputRefs.current[index]?.click();
        setOpenMenuIndex(null);
    };

    const handleStepImageChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const fileReaders: Promise<string>[] = Array.from(files).map(
            (file) =>
                new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.readAsDataURL(file);
                })
        );

        Promise.all(fileReaders).then((base64Images) => {
            const updated = [...stepImages];
            if (!updated[index]) updated[index] = [];
            updated[index] = [...updated[index], ...base64Images];
            setStepImages(updated);
        });
    };

    const handleAddGroup = () => {
        setShowGroupInput(true);
    };

    const handleCreateGroup = () => {
        if (newGroupName.trim()) {
            setIngredientGroups([...ingredientGroups, {
                name: newGroupName,
                ingredients: []
            }]);
            setNewGroupName('');
            setShowGroupInput(false);
            setActiveGroupIndex(ingredientGroups.length);
        }
    };

    const [newIngredientList, setNewIngredientList] = useState<{ name: string; quantity: string }[]>([]);

    const handleQuantityChange = (index: number, value: string) => {
        const updated = [...newIngredientList];
        updated[index].quantity = value;
        setNewIngredientList(updated);
    };

    const handleGroupIngredientQuantityChange = (
        groupIndex: number,
        ingredientIndex: number,
        newQuantity: string
    ) => {
        const updated = [...ingredientGroups];
        updated[groupIndex].ingredients[ingredientIndex].quantity = newQuantity;
        setIngredientGroups(updated);
    };

    const handleRemoveGroupIngredient = (groupIndex: number, ingredientIndex: number) => {
        const updated = [...ingredientGroups];
        updated[groupIndex].ingredients.splice(ingredientIndex, 1);
        setIngredientGroups(updated);
    };





    return (
        <>
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
                    form="recipe-form"
                    className="create-button"
                    disabled={!recipe.image}
                    title={!recipe.image ? "You must add a picture" : undefined}
                >
                    Create
                </button>
            </div>

    <form id="recipe-form" className="recipe-form" onSubmit={handleSubmit}>
            {/* ───────── Hero de imagen ───────── */}
            <div className="image-upload" onClick={triggerSelect}>
                {recipe.image ? (
                    <img src={recipe.image} alt="preview" className="image-preview"/>
                ) : (
                    <>
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
            <StyledTextField
                label="Title"
                value={recipe.name}
                onChange={(e) => setRecipe({...recipe, name: e.target.value})}
            />
            <StyledTextField
                label="Description"
                value={recipe.description}
                onChange={(e) => setRecipe({...recipe, description: e.target.value})}
            />


            <div>
                <StyledTextField
                    label="Time of duration"
                    value={recipe.time}
                    onChange={(e) => setRecipe({...recipe, time: e.target.value})}
                />
            </div>
        {/* INGREDIENTS SECTION */}
        <div className="ingredients-section">
            <h4 style={{
            fontFamily: 'Albert Sans, sans-serif',
            fontSize: '1.5rem',
            fontWeight: 700
            }}>Ingredients</h4>

            <StyledTextField
                label="Ingredient"
                value={newIngredient}
                onChange={(e) => setNewIngredient(e.target.value)}
            />

            {/* Ingredientes sueltos */}
            {newIngredientList.map((item, i) => (
                <div key={i} className="ingredient-row">
                    <input
                        type="text"
                        className="ingredient-qty"
                        placeholder="Ej: 2"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(i, e.target.value)}
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
                        onClick={() => {
                            const updated = [...newIngredientList];
                            updated.splice(i, 1);
                            setNewIngredientList(updated);
                        }}
                    >
                        ⋯
                    </button>
                </div>
            ))}

            {/* Ingredientes agrupados inline */}
            {ingredientGroups.map((group, groupIndex) => (
                <div key={groupIndex} className="ingredient-group-inline">
                    <div className="group-header-inline">
                        <span className="group-name">{group.name}</span>
                        <span
                            className="group-remove"
                            onClick={() => {
                                const updated = [...ingredientGroups];
                                updated.splice(groupIndex, 1);
                                setIngredientGroups(updated);
                            }}
                        >
          ✖
        </span>
                    </div>

                    {group.ingredients.map((ingredient, idx) => (
                        <div key={idx} className="ingredient-row">
                            <input
                                type="text"
                                className="ingredient-qty"
                                placeholder="Ej: 2"
                                value={ingredient.quantity || ''}
                                onChange={(e) =>
                                    handleGroupIngredientQuantityChange(groupIndex, idx, e.target.value)
                                }
                            />
                            <input
                                type="text"
                                value={ingredient.name}
                                disabled
                                className="ingredient-input"
                            />
                            <button
                                type="button"
                                className="delete-ingredient"
                                onClick={() => handleRemoveGroupIngredient(groupIndex, idx)}
                            >
                                ⋯
                            </button>
                        </div>
                    ))}

                </div>
            ))}

            {/* Botones principales */}
            <div className="buttons-container">
                <button type="button" className="add-button" onClick={handleAddIngredient}>
                    + Add ingredient
                </button>
                <button type="button" className="add-button" onClick={handleAddGroup}>
                    + Add Group
                </button>
            </div>

            {/* Input para nombre de grupo */}
            {showGroupInput && (
                <div className="group-input-container">
                    <StyledTextField
                        label="Group name"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                    />
                    <button
                        type="button"
                        className="create-group-button"
                        onClick={handleCreateGroup}
                    >
                        Create group
                    </button>
                </div>
            )}
        </div>

        <div className="steps-section">
            <h4  style={{
                fontFamily: 'Albert Sans, sans-serif',
                fontSize: '1.5rem',
                fontWeight: 700
            }}>Steps</h4>

            {stepsList.map((step, index) => (
                <div key={index} className="step-card">
                    {/* Línea de número + input + menú: en fila */}
                    <div className="step-header">
                        <div className="step-number">{index + 1}</div>
                        <input
                            className="step-input"
                            type="text"
                            placeholder="Ex: Mix the eggs with the milk..."
                            value={step}
                            onChange={(e) => handleStepChange(index, e.target.value)}
                        />
                        <div className="step-menu-container">
                            <button type="button" className="menu-btn" onClick={() => toggleMenu(index)}>⋯</button>
                            {openMenuIndex === index && (
                                <div className="menu-dropdown">
                                    <button type="button" onClick={() => handleAddImageToStep(index)}>Add picture</button>
                                    <button type="button" onClick={() => handleRemoveStep(index)}>Delete step</button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 👇 Miniaturas de imágenes: fuera del header, así quedan ABAJO */}
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

                    {/* input file oculto */}
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
                        checked={recipe.isPublic}
                        onChange={(e) => setRecipe({ ...recipe, isPublic: e.target.checked })}
                    />
                    <span className="slider"></span>
                </label>
            </div>
            <p className="visibility-text">
                {recipe.isPublic ? "This recipe will be public." : "This recipe will be private."}
            </p>
        </div>

    </form>
     </>
 );
};

export default NewRecipeForm;