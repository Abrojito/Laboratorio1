import React, { useEffect, useState } from "react";
import {
    fetchPendingShoppingLists,
    createShoppingList
} from "../api/shoppingListApi";

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
    const [creatingNew, setCreatingNew] = useState(false);
    const [newListName, setNewListName] = useState("");
    const token = localStorage.getItem("token") || "";

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

    const handleAddToList = async () => {
        try {
            const payload = {
                name: newListName,
                recipeIds: recipeIds,
                mealPrepIds: mealPrepId ? [mealPrepId] : [],
            };
            await createShoppingList(payload, token);
            alert("Lista creada y receta/meals agregados!");
            setShowMenu(false);
            setCreatingNew(false);
            setNewListName("");
        } catch {
            alert("Error creando la lista.");
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

            alert("Agregado a lista existente!");
            setShowMenu(false);
        } catch (err) {
            console.error("Error agregando a lista existente", err);
            alert("No se pudo agregar a la lista.");
        }
    };


    return (
        <div style={{ position: "relative", display: "inline-block" }}>
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
                            + Crear nueva lista
                        </button>
                    ) : (
                        <div style={{ marginTop: "1rem" }}>
                            <input
                                type="text"
                                placeholder="Nombre de la lista"
                                value={newListName}
                                onChange={(e) => setNewListName(e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "0.4rem",
                                    marginBottom: "0.5rem",
                                    borderRadius: "5px",
                                    border: "1px solid #ccc"
                                }}
                            />
                            <button
                                onClick={() => handleAddToList()}
                                style={{
                                    background: "#28a745",
                                    color: "white",
                                    border: "none",
                                    padding: "0.4rem 0.8rem",
                                    borderRadius: "5px",
                                    cursor: "pointer",
                                    width: "100%"
                                }}
                                disabled={!newListName.trim()}
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

export default ShoppingListSelector;
