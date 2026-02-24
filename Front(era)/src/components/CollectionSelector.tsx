import React, { useEffect, useRef, useState } from "react";
import {
    fetchCollections,
    createCollection,
    addRecipeToCollection,
    addMealPrepToCollection,
} from "../api/collectionApi";
import { useModal } from "../context/ModalContext";

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
    const { prompt, alert } = useModal();
    const containerRef = useRef<HTMLDivElement>(null);

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

    useEffect(() => {
        if (!showMenu) return;
        const handleClickOutside = (event: MouseEvent) => {
            if (!containerRef.current?.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showMenu]);

    const handleAddToCollection = async (id: number) => {
        try {
            if (recipeId) await addRecipeToCollection(id, recipeId, token);
            if (mealPrepId) await addMealPrepToCollection(id, mealPrepId, token);
            await alert({ title: "Colecciones", message: "Agregado a la colección!" });
            setShowMenu(false);
        } catch (err) {
            await alert({ title: "Colecciones", message: "No se pudo agregar a la colección." });
        }
    };

    const handleCreateNew = async () => {
        const newName = await prompt({
            title: "Crear colección",
            label: "Nombre de la colección",
            confirmText: "Crear y agregar",
            cancelText: "Cancelar",
            required: true,
            requiredMessage: "El nombre no puede estar vacío.",
        });

        if (newName === null) return;

        try {
            const payload = {
                name: newName,
                recipeIds: recipeId ? [recipeId] : [],
                mealPrepIds: mealPrepId ? [mealPrepId] : [],
            };
            await createCollection(payload, token);
            await alert({ title: "Colecciones", message: "Colección creada!" });
            setShowMenu(false);
        } catch {
            await alert({ title: "Colecciones", message: "Error creando la colección." });
        }
    };

    return (
        <div ref={containerRef} style={{ position: "relative", display: "inline-block", zIndex: showMenu ? 20 : "auto" }}>
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
                    top: "calc(100% + 8px)",
                    left: 0,
                    background: "white",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                    padding: "1rem",
                    zIndex: 20,
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

                    <button
                        onClick={handleCreateNew}
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
                </div>
            )}
        </div>
    );
};

export default CollectionSelector;
