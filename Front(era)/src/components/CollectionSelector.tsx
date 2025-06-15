import React, { useEffect, useState } from "react";
import {
    fetchCollections,
    createCollection,
    addRecipeToCollection,
    addMealPrepToCollection,
} from "../api/collectionApi";

interface Collection {
    id: number;
    name: string;
}

interface Props {
    recipeId?: number;
    mealPrepId?: number;
}

const CollectionSelector: React.FC<Props> = ({ recipeId, mealPrepId }) => {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [showMenu, setShowMenu] = useState(false);
    const [creatingNew, setCreatingNew] = useState(false);
    const [newName, setNewName] = useState("");

    const token = localStorage.getItem("token") || "";

    const loadCollections = async () => {
        try {
            const data = await fetchCollections(token);
            setCollections(data);
        } catch {
            console.error("Error fetching collections.");
        }
    };

    useEffect(() => {
        if (showMenu) loadCollections();
    }, [showMenu]);

    const handleAddToCollection = async (id: number) => {
        try {
            if (recipeId) await addRecipeToCollection(id, recipeId, token);
            if (mealPrepId) await addMealPrepToCollection(id, mealPrepId, token);
            alert("Agregado a la colección!");
            setShowMenu(false);
        } catch (err) {
            alert("No se pudo agregar a la colección.");
        }
    };

    const handleCreateNew = async () => {
        try {
            const payload = {
                name: newName,
                recipeIds: recipeId ? [recipeId] : [],
                mealPrepIds: mealPrepId ? [mealPrepId] : [],
            };
            await createCollection(payload, token);
            alert("Colección creada!");
            setShowMenu(false);
            setCreatingNew(false);
            setNewName("");
        } catch {
            alert("Error creando la colección.");
        }
    };

    return (
        <div style={{ position: "relative", display: "inline-block" }}>
            <button
                onClick={() => setShowMenu(prev => !prev)}
                style={{
                    background: "#9C27B0",
                    color: "white",
                    border: "none",
                    padding: "0.6rem 1rem",
                    borderRadius: "5px",
                    cursor: "pointer"
                }}
            >
                Guardar en colección
            </button>

            {showMenu && (
                <div style={{
                    position: "absolute",
                    top: "110%",
                    left: 0,
                    background: "white",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                    padding: "1rem",
                    zIndex: 999,
                    minWidth: "240px"
                }}>
                    <h4>Tus colecciones</h4>
                    {collections.length === 0 ? (
                        <p>No tenés colecciones.</p>
                    ) : (
                        collections.map(c => (
                            <div key={c.id} style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "0.5rem"
                            }}>
                                <span>{c.name}</span>
                                <button
                                    onClick={() => handleAddToCollection(c.id)}
                                    style={{
                                        background: "#4CAF50",
                                        color: "white",
                                        border: "none",
                                        padding: "0.3rem 0.6rem",
                                        borderRadius: "5px",
                                        cursor: "pointer"
                                    }}
                                >
                                    Agregar
                                </button>
                            </div>
                        ))
                    )}

                    {!creatingNew ? (
                        <button
                            onClick={() => setCreatingNew(true)}
                            style={{
                                marginTop: "1rem",
                                background: "#555",
                                color: "white",
                                border: "none",
                                padding: "0.4rem 0.8rem",
                                borderRadius: "5px",
                                cursor: "pointer",
                                width: "100%"
                            }}
                        >
                            + Crear nueva colección
                        </button>
                    ) : (
                        <div style={{ marginTop: "1rem" }}>
                            <input
                                type="text"
                                placeholder="Nombre de la colección"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "0.4rem",
                                    marginBottom: "0.5rem",
                                    borderRadius: "5px",
                                    border: "1px solid #ccc"
                                }}
                            />
                            <button
                                onClick={handleCreateNew}
                                style={{
                                    background: "#28a745",
                                    color: "white",
                                    border: "none",
                                    padding: "0.4rem 0.8rem",
                                    borderRadius: "5px",
                                    cursor: "pointer",
                                    width: "100%"
                                }}
                                disabled={!newName.trim()}
                            >
                                Crear y agregar
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CollectionSelector;
