import React, { useEffect, useRef, useState } from "react";
import {
    fetchPendingShoppingLists,
    createShoppingList
} from "../api/shoppingListApi";
import { useModal } from "../context/ModalContext";

interface ShoppingList {
    id: number;
    name: string;
}

interface Props {
    recipeIds?: number[];
    mealPrepId?: number;
}

const ShoppingListSelector: React.FC<Props> = ({ recipeIds = [], mealPrepId }) => {
    const [lists, setLists] = useState<ShoppingList[]>([]);
    const [showMenu, setShowMenu] = useState(false);
    const token = localStorage.getItem("token") || "";
    const { prompt, alert } = useModal();
    const containerRef = useRef<HTMLDivElement>(null);

    const loadPendingLists = async () => {
        try {
            const data = await fetchPendingShoppingLists(token);
            setLists(data);
        } catch {
            console.error("Error fetching pending shopping lists.");
        }
    };

    useEffect(() => {
        if (showMenu) {
            loadPendingLists();
        }
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

    const handleAddToList = async () => {
        const newListName = await prompt({
            title: "Crear lista",
            label: "Nombre de la lista",
            confirmText: "Crear y agregar",
            cancelText: "Cancelar",
            required: true,
            requiredMessage: "El nombre no puede estar vacío.",
        });

        if (newListName === null) return;

        try {
            const payload = {
                name: newListName,
                recipeIds: recipeIds,
                mealPrepIds: mealPrepId ? [mealPrepId] : [],
            };
            await createShoppingList(payload, token);
            await alert({ title: "Listas", message: "Lista creada y receta/meals agregados!" });
            setShowMenu(false);
        } catch {
            await alert({ title: "Listas", message: "Error creando la lista." });
        }
    };


    const handleAddToExistingList = async (listId: number) => {
        try {
            const payload = {
                recipeIds: recipeIds,
                mealPrepIds: mealPrepId ? [mealPrepId] : [],
            };

            await fetch(`http://localhost:8080/api/shopping-lists/${listId}/add-recipes`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload.recipeIds.length ? payload.recipeIds : payload.mealPrepIds),
            });

            await alert({ title: "Listas", message: "Agregado a lista existente!" });
            setShowMenu(false);
        } catch (err) {
            console.error("Error agregando a lista existente", err);
            await alert({ title: "Listas", message: "No se pudo agregar a la lista." });
        }
    };


    return (
        <div ref={containerRef} style={{ position: "relative", display: "inline-block", zIndex: showMenu ? 20 : "auto" }}>
            <button
                onClick={() => setShowMenu(prev => !prev)}
                style={{
                    background: "#A6B240",
                    color: "white",
                    border: "none",
                    padding: "0.6rem 1rem",
                    borderRadius: "5px",
                    cursor: "pointer"
                }}
            >
                Agregar a lista de compras
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
                    <h4>Listas pendientes</h4>
                    {lists.length === 0 ? (
                        <p>No tenés listas pendientes.</p>
                    ) : (
                        lists.map(list => (
                            <div key={list.id} style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "0.5rem"
                            }}>
                                <span>{list.name}</span>
                                <button
                                    onClick={() => handleAddToExistingList(list.id)}
                                    style={{
                                        background: "#007bff",
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
                        onClick={handleAddToList}
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
                        + Crear nueva lista
                    </button>
                </div>
            )}
        </div>
    );
};

export default ShoppingListSelector;
