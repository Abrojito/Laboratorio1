import React, { useEffect, useState } from "react";
import IngredientSearch from "../components/IngredientSearch";
import {useNavigate} from "react-router-dom";

interface Ingredient {
    id: number;
    name: string;
}

const UndesiredIngredients: React.FC = () => {
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const navigate = useNavigate();

    const token = localStorage.getItem("token") || "";

    const loadIngredients = async () => {
        try {
            const res = await fetch("http://localhost:8080/api/undesired", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Error al cargar lista");
            const data = await res.json();
            setIngredients(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        loadIngredients();
    }, []);

    const handleRemove = async (id: number) => {
        try {
            await fetch(`http://localhost:8080/api/undesired/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            setIngredients(prev => prev.filter(ing => ing.id !== id));
        } catch (err) {
            console.error("No se pudo eliminar el ingrediente", err);
        }
    };

    const handleAdd = (ingredient: Ingredient) => {
        if (ingredients.some(i => i.id === ingredient.id)) return;
        setIngredients(prev => [...prev, ingredient]); // solo actualiza estado
    };

    return (
        <>
            <button
                onClick={() => navigate('/profile')}
                style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '2rem',
                    cursor: 'pointer',
                    color: '#A6B240',
                    position: 'absolute',
                    top: '20px',
                    left: '20px',
                    zIndex: 999,
                }}
            >
                ←
            </button>
        <div style={{ padding: "1.5rem", maxWidth: "600px", margin: "auto", marginTop: "2.5rem" }}>
            <h1>Ingredientes no deseados</h1>
            <IngredientSearch onIngredientAdded={handleAdd} />

            <ul style={{ listStyle: "none", padding: 0 }}>
                {ingredients.map(ing => (
                    <li key={ing.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                        <span>{ing.name}</span>
                        <button onClick={() => handleRemove(ing.id)} style={{ background: "transparent", border: "none", color: "red", fontSize: "1.2rem", cursor: "pointer" }}>
                            ✖
                        </button>
                    </li>
                ))}
            </ul>
        </div>
      </>
    );
};

export default UndesiredIngredients;
