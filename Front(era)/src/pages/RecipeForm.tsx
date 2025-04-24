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
    });


    const [stepsList, setStepsList] = useState<string[]>(['']);
    const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);


    //const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [newIngredient, setNewIngredient] = useState<string>('');
    const [newIngredientList, setNewIngredientList] = useState<string[]>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const [stepImages, setStepImages] = useState<string[][]>([[]]);
    const stepImageInputRefs = useRef<(HTMLInputElement | null)[]>([]);



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
        const response = await fetch(`http://localhost:8080/ingredients`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({id: 0, name: newIngredient}),
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
                    ...(token ? {Authorization: `Bearer ${token}`} : {}),
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

    <form className="recipe-form" onSubmit={handleSubmit}>
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
            {/* Ingredientes */}
            <div>
                <h4 style={{
                    fontFamily: 'Albert Sans, sans-serif',
                    fontSize: '1.5rem',
                    fontWeight: 700
                }}>Ingredients</h4>

                <div style={{marginTop: -5}}>
                    <StyledTextField
                        type="name"
                        label="Ingredient"
                        value={newIngredient || ''}
                        onChange={(e) => setNewIngredient(e.target.value)}
                    />
                </div>


                <div className="buttons-container">

                    <button type="button" className="add-button" onClick={handleAddIngredient}>+ Add ingredient</button>
                    <button type="button" className="add-button" onClick={handleAddIngredient}>+ Add Group</button>
                </div>
            </div>

            <div>
                <ul>
                    {newIngredientList.map((name, i) => (
                        <li key={i}>Name: {name}</li>
                    ))}
                </ul>
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
        </form>
     </>
 );
};

export default NewRecipeForm;