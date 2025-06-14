import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    fetchShoppingListById,
    toggleShoppingListItem,
    repeatShoppingList,
    deleteShoppingList
} from "../api/shoppingListApi";

interface ShoppingListItem {
    id: number;
    ingredientName: string;
    quantity: string;
    checked: boolean;
    sourceRecipeName: string;
}

interface ShoppingList {
    id: number;
    name: string;
    createdAt: string;
    completedAt: string | null;
    items: ShoppingListItem[];
}

const ShoppingListDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [list, setList] = useState<ShoppingList | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const token = localStorage.getItem("token") || "";

    const loadList = async () => {
        if (!id) return;
        try {
            const data = await fetchShoppingListById(Number(id), token);
            setList(data);
        } catch {
            setError("Error cargando la lista.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadList();
    }, [id]);

    const handleToggleItem = async (itemId: number) => {
        if (!id) return;
        try {
            await toggleShoppingListItem(Number(id), itemId, token);
            loadList();
        } catch {
            alert("Error al marcar/desmarcar.");
        }
    };

    const handleRepeat = async () => {
        if (!id) return;
        try {
            await repeatShoppingList(Number(id), token);
            loadList();
        } catch {
            alert("Error al repetir la lista.");
        }
    };

    const handleDelete = async () => {
        if (!id) return;
        if (!window.confirm("¿Seguro que querés borrar esta lista?")) return;
        try {
            await deleteShoppingList(Number(id), token);
            navigate("/shopping-list");
        } catch {
            alert("Error al borrar la lista.");
        }
    };

    if (loading) return <div style={{ padding: "1rem" }}>Cargando...</div>;
    if (error || !list) return <div style={{ padding: "1rem" }}>Error: {error ?? "Lista no encontrada."}</div>;

    return (
        <div style={{ padding: "1rem", maxWidth: "800px", margin: "auto" }}>
            <button onClick={() => navigate("/shopping-list")}
                    style={{
                        background: "none",
                        border: "none",
                        fontSize: "1.5rem",
                        cursor: "pointer",
                        color: "#A6B240",
                        marginBottom: "1rem"
                    }}>
                ← Volver
            </button>

            <h1 style={{ marginBottom: "0.25rem" }}>{list.name || "Lista sin nombre"}</h1>
            <p style={{ marginBottom: "0.5rem", fontSize: "0.95rem" }}>
                Creada: {new Date(list.createdAt).toLocaleString()}
            </p>
            {list.completedAt && (
                <p style={{ fontSize: "0.9rem", color: "#4CAF50" }}>
                    Completada: {new Date(list.completedAt).toLocaleString()}
                </p>
            )}

            <h2 style={{ marginTop: "1.5rem", fontSize: "1.3rem" }}>Ingredientes</h2>
            {list.items.length === 0 ? (
                <p>No hay ingredientes en esta lista.</p>
            ) : (
                list.items.map(item => (
                    <div key={item.id} style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0.75rem",
                        border: "1px solid #ddd",
                        borderRadius: "10px",
                        marginBottom: "0.5rem",
                        backgroundColor: item.checked ? "#eefbe7" : "#f9f9f9"
                    }}>
                        <div style={{ flexGrow: 1 }}>
                            <strong>{item.ingredientName}</strong> — {item.quantity}
                            <br />
                            <small style={{ color: "#666" }}>De receta: {item.sourceRecipeName}</small>
                        </div>
                        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                            <input
                                type="checkbox"
                                checked={item.checked}
                                onChange={() => handleToggleItem(item.id)}
                                style={{ transform: "scale(1.5)", cursor: "pointer" }}
                            />
                            <span style={{ fontWeight: "bold" }}>{item.checked ? "Hecho" : "Pendiente"}</span>
                        </label>
                    </div>
                ))
            )}

            <div style={{ marginTop: "2rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                {list.completedAt && (
                    <button
                        onClick={handleRepeat}
                        style={{
                            background: "#007bff",
                            color: "white",
                            border: "none",
                            padding: "0.6rem 1.2rem",
                            borderRadius: "6px",
                            cursor: "pointer"
                        }}
                    >
                        Repetir lista
                    </button>
                )}
                <button
                    onClick={handleDelete}
                    style={{
                        background: "#dc3545",
                        color: "white",
                        border: "none",
                        padding: "0.6rem 1.2rem",
                        borderRadius: "6px",
                        cursor: "pointer"
                    }}
                >
                    Borrar lista
                </button>
            </div>
        </div>
    );
};

export default ShoppingListDetailPage;
