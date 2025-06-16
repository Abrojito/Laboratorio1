import React, { useState } from "react";

interface Ingredient {
    id: number;
    name: string;
}

interface Props {
    onIngredientAdded: (ingredient: Ingredient) => void;
}

const IngredientSearch: React.FC<Props> = ({ onIngredientAdded }) => {
    const [term, setTerm] = useState("");

    const handleSearchAndAdd = async () => {
        if (!term.trim()) return;

        try {
            const res = await fetch(`http://localhost:8080/ingredients/search?term=${encodeURIComponent(term)}`);
            const list = await res.json();

            let ingredient: Ingredient;

            if (list.length > 0) {
                ingredient = list[0];
            } else {
                const postRes = await fetch("http://localhost:8080/ingredients", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: 0, name: term }),
                });

                if (!postRes.ok) throw new Error("Error creando ingrediente");
                ingredient = await postRes.json();
            }

            const token = localStorage.getItem("token") || "";
            const addRes = await fetch(`http://localhost:8080/api/undesired/${ingredient.id}`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!addRes.ok) throw new Error("No se pudo agregar a no deseados");

            onIngredientAdded(ingredient); // actualizar estado en componente padre
            setTerm("");

        } catch (err) {
            console.error("No se pudo agregar el ingrediente", err);
            alert("No se pudo agregar el ingrediente.");
        }
    };

    return (
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
            <input
                type="text"
                placeholder="Buscar o crear ingrediente"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                style={{ flex: 1, padding: "0.5rem" }}
            />
            <button
                onClick={handleSearchAndAdd}
                style={{
                    background: "#A6B240",
                    color: "white",
                    border: "none",
                    padding: "0.5rem 1rem",
                    borderRadius: "6px",
                    cursor: "pointer"
                }}
            >
                Agregar
            </button>
        </div>
    );
};

export default IngredientSearch;
