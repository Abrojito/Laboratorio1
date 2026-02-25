import '../styles/RecipeForm.css';
import React, { useState, FormEvent, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import StyledTextField from "../components/StyledTextField";
import { useModal } from "../context/ModalContext";


interface RecipeRequestDTO {
    name: string;
    description: string;
    image: string; // base64 o URL
    category: string;
    author: string;
    //userId: number;
    time: string;
    ingredientIds: Map<number, string>;
    steps: string[];
    publicRecipe: boolean;
}

const NewRecipeForm: React.FC  = () => {
    const navigate = useNavigate();
    const { alert } = useModal();
    const [recipe, setRecipe] = useState<RecipeRequestDTO>({
        name: '',
        description: '',
        image: '',
        category: '',
        author: '',
        //userId: 1,
        time: '',
        ingredientIds: new Map<number, string>(),
        steps: [],
        publicRecipe: true,
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
    const [ingredientNames, setIngredientNames] = useState<{ id: number; name: string }[]>([]);
    const [newIngredientQuantity, setNewIngredientQuantity] = useState('0g');



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
            await alert({ title: "Recetas", message: "El nombre del ingrediente no puede estar vacío" });
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
                const existing = await fetch(`http://localhost:8080/ingredients/search?name=${encodeURIComponent(newIngredient)}`);
                if (!existing.ok) throw new Error("Ingrediente no encontrado o error en fallback");
                const data = await existing.json();
                newIngredientId = data.id;
            }

            if (activeGroupIndex !== null) {
                // solo agregar a grupo
                const updatedGroups = [...ingredientGroups];
                updatedGroups[activeGroupIndex].ingredients.push({
                    name: newIngredient,
                    quantity: newIngredientQuantity || '0g',
                });
                setIngredientGroups(updatedGroups);
            } else {
                // agregar a ingredientIds + ingredientNames
                setRecipe((prev) => {
                    const updated = new Map(prev.ingredientIds);
                    if (!updated.has(newIngredientId)) {
                        updated.set(newIngredientId, newIngredientQuantity || '0g');
                    }
                    return { ...prev, ingredientIds: updated };
                });

                setIngredientNames((prev) => {
                    const alreadyExists = prev.some((ing) => ing.id === newIngredientId);
                    return alreadyExists ? prev : [...prev, { id: newIngredientId, name: newIngredient }];
                });
            }

            setNewIngredient('');
            setNewIngredientQuantity('0g');
        } catch (error) {
            console.error('Error al añadir ingrediente:', error);
            await alert({ title: "Recetas", message: "No se pudo añadir el ingrediente. Inténtalo de nuevo." });
        }
    };




    const handleIngredientQuantityChange = (id: number, value: string) => {
        setRecipe((prev) => {
            const updated = new Map(prev.ingredientIds);
            updated.set(id, value);
            return { ...prev, ingredientIds: updated };
        });
    };



    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        try {
            const token   = localStorage.getItem('token');
            const userId  = Number(localStorage.getItem('userId'));

            const payload = {
                ...recipe,
                userId,
                steps: stepsList,
                ingredientIds: Object.fromEntries(recipe.ingredientIds),
            };

            const response = await fetch('http://localhost:8080/api/recipes', {
                method : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const err = await response.text();
                throw new Error(err || 'Error creando receta');
            }

            navigate('/home');

        } catch (err: any) {
            await alert({ title: "Recetas", message: 'Error creando receta: ' + err.message });
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
                    title={!recipe.image ? "Debes agregar una imagen" : undefined}
                >
                    Crear
                </button>
            </div>

    <form id="recipe-form" className="recipe-form" onSubmit={handleSubmit}>
            {/* ───────── Hero de imagen ───────── */}
            <div className="image-upload" onClick={triggerSelect}>
                {recipe.image ? (
                    <img src={recipe.image} alt="preview" className="image-preview"/>
                ) : (
                    <>
                        <p className="image-helper">Agregá una imagen de tu receta</p>
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
                value={recipe.name}
                onChange={(e) => setRecipe({...recipe, name: e.target.value})}
            />
            <StyledTextField
                label="Descripción"
                value={recipe.description}
                onChange={(e) => setRecipe({...recipe, description: e.target.value})}
            />


            <div>
                <StyledTextField
                    label="Duración"
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
            }}>Ingredientes</h4>

            <div className="ingredient-inputs-row">
                <StyledTextField
                    label="Ingrediente"
                    value={newIngredient}
                    onChange={(e) => setNewIngredient(e.target.value)}
                    style={{ flex: 2, marginRight: '1rem' }}
                />
                <StyledTextField
                    label="Cantidad"
                    value={newIngredientQuantity}
                    onChange={(e) => setNewIngredientQuantity(e.target.value)}
                    style={{ flex: 1 }}
                />
            </div>


            {/* Ingredientes sueltos */}
            {ingredientNames.map((item) => (
                <div key={item.id} className="ingredient-row">
                    <input
                        type="text"
                        className="ingredient-qty"
                        placeholder="Ej: 2g"
                        value={recipe.ingredientIds.get(item.id) || ''}
                        onChange={(e) =>
                            handleIngredientQuantityChange(item.id, e.target.value)
                        }
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
                            const updated = new Map(recipe.ingredientIds);
                            updated.delete(item.id);
                            setRecipe({ ...recipe, ingredientIds: updated });
                            setIngredientNames((prev) =>
                                prev.filter((ing) => ing.id !== item.id)
                            );
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
                    + Agregar ingrediente
                </button>
                <button type="button" className="add-button" onClick={handleAddGroup}>
                    + Agregar grupo
                </button>
            </div>

            {/* Input para nombre de grupo */}
            {showGroupInput && (
                <div className="group-input-container">
                    <StyledTextField
                        label="Nombre del grupo"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                    />
                    <button
                        type="button"
                        className="create-group-button"
                        onClick={handleCreateGroup}
                    >
                        Crear grupo
                    </button>
                </div>
            )}
        </div>

        <div className="steps-section">
            <h4  style={{
                fontFamily: 'Albert Sans, sans-serif',
                fontSize: '1.5rem',
                fontWeight: 700
            }}>Pasos</h4>

            {stepsList.map((step, index) => (
                <div key={index} className="step-card">
                    {/* Línea de número + input + menú: en fila */}
                    <div className="step-header">
                        <div className="step-number">{index + 1}</div>
                        <input
                            className="step-input"
                            type="text"
                            placeholder="Ej: Mezclar los huevos con la leche..."
                            value={step}
                            onChange={(e) => handleStepChange(index, e.target.value)}
                        />
                        <div className="step-menu-container">
                            <button type="button" className="menu-btn" onClick={() => toggleMenu(index)}>⋯</button>
                            {openMenuIndex === index && (
                                <div className="menu-dropdown">
                                    <button type="button" onClick={() => handleAddImageToStep(index)}>Agregar imagen</button>
                                    <button type="button" onClick={() => handleRemoveStep(index)}>Eliminar paso</button>
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
                        + Agregar paso
                    </button>
                </div>
           </div>
        <div className="visibility-card">
            <div className="visibility-header">
                <h4 className="visibility-title">¿Querés que tu receta sea pública?</h4>
                <label className="switch">
                    <input
                        type="checkbox"
                        checked={recipe.publicRecipe}
                        onChange={e =>
                            setRecipe({ ...recipe, publicRecipe: e.target.checked })}
                    />
                    <span className="slider"></span>
                </label>
            </div>
            <p className="visibility-text">
                {recipe.publicRecipe ? "Esta receta será pública." : "Esta receta será privada."}
            </p>
        </div>

    </form>
     </>
 );
};

export default NewRecipeForm;
