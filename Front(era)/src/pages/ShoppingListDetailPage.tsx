import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    fetchShoppingListById,
    toggleShoppingListItem,
    repeatShoppingList,
    deleteShoppingList
} from "../api/shoppingListApi";
import { useModal } from "../context/ModalContext";
import { quotePrices } from "../api/priceApi";
import { PriceCandidate, PriceQuoteResponse } from "../types/Prices";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Typography from "@mui/material/Typography";

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
    const [pricingLoading, setPricingLoading] = useState(false);
    const [quoteResponse, setQuoteResponse] = useState<PriceQuoteResponse | null>(null);
    const [selectedCandidates, setSelectedCandidates] = useState<Record<string, PriceCandidate>>({});
    const [totalUI, setTotalUI] = useState(0);
    const token = localStorage.getItem("token") || "";
    const { alert } = useModal();

    const itemKey = (name: string, index: number) => `${name}__${index}`;

    const recalculateTotal = (
        backendTotal: number,
        selected: Record<string, PriceCandidate>,
        items: ShoppingListItem[]
    ) => {
        const selectedTotal = items.reduce((acc, item, index) => {
            const quoteItem = quoteResponse?.items[index];
            if (!quoteItem || !quoteItem.ambiguous) return acc;
            const selectedCandidate = selected[itemKey(item.ingredientName, index)];
            return acc + (selectedCandidate?.price ?? 0);
        }, 0);
        return backendTotal + selectedTotal;
    };

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
            await alert({ title: "Lista de compras", message: "Error al marcar/desmarcar." });
        }
    };

    const handleRepeat = async () => {
        if (!id) return;
        try {
            await repeatShoppingList(Number(id), token);
            loadList();
        } catch {
            await alert({ title: "Lista de compras", message: "Error al repetir la lista." });
        }
    };

    const handleDelete = async () => {
        if (!id) return;
        if (!window.confirm("¿Seguro que querés borrar esta lista?")) return;
        try {
            await deleteShoppingList(Number(id), token);
            navigate("/shopping-list");
        } catch {
            await alert({ title: "Lista de compras", message: "Error al borrar la lista." });
        }
    };

    const handleCalculatePrices = async () => {
        if (!list) return;
        setPricingLoading(true);
        try {
            const payload = list.items.map((item) => ({
                name: item.ingredientName,
                quantityText: item.quantity ?? "",
            }));
            const response = await quotePrices(payload);
            setQuoteResponse(response);
            setSelectedCandidates({});
            setTotalUI(response.totalEstimated);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Error al calcular precios.";
            await alert({ title: "Precios", message });
        } finally {
            setPricingLoading(false);
        }
    };

    const handleSelectCandidate = (
        key: string,
        candidateIndex: string,
        quoteItem: PriceQuoteResponse["items"][number]
    ) => {
        const next = { ...selectedCandidates };
        if (candidateIndex === "") {
            delete next[key];
        } else {
            const candidate = quoteItem.candidates?.[Number(candidateIndex)];
            if (candidate) next[key] = candidate;
        }
        setSelectedCandidates(next);
        setTotalUI(recalculateTotal(quoteResponse?.totalEstimated ?? 0, next, list?.items ?? []));
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

            <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
                <Button variant="contained" onClick={handleCalculatePrices} disabled={pricingLoading}>
                    {pricingLoading ? <CircularProgress size={18} color="inherit" /> : "Calcular precios"}
                </Button>
            </div>

            <h2 style={{ marginTop: "1.5rem", fontSize: "1.3rem" }}>Ingredientes</h2>
            {list.items.length === 0 ? (
                <p>No hay ingredientes en esta lista.</p>
            ) : (
                list.items.map((item, index) => {
                    const key = itemKey(item.ingredientName, index);
                    const quoteItem = quoteResponse?.items[index];
                    const selectedCandidate = selectedCandidates[key];
                    const selectedIndex = quoteItem?.candidates?.findIndex(
                        (c) => c.description === selectedCandidate?.description && c.price === selectedCandidate?.price
                    );

                    return (
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
                            {quoteResponse && (
                                <div style={{ marginTop: "0.6rem" }}>
                                    {!quoteItem || !quoteItem.found ? (
                                        <Typography variant="body2" color="text.secondary">
                                            Sin precio
                                        </Typography>
                                    ) : quoteItem.ambiguous ? (
                                        <>
                                            <Typography variant="body2" sx={{ mb: 0.5 }}>
                                                Elegí producto:
                                            </Typography>
                                            <Select
                                                size="small"
                                                fullWidth
                                                value={selectedIndex !== undefined && selectedIndex >= 0 ? String(selectedIndex) : ""}
                                                onChange={(e) => handleSelectCandidate(key, e.target.value, quoteItem)}
                                            >
                                                <MenuItem value="">
                                                    <em>Seleccionar...</em>
                                                </MenuItem>
                                                {(quoteItem.candidates ?? []).map((candidate, candidateIdx) => (
                                                    <MenuItem key={`${candidate.description}-${candidateIdx}`} value={String(candidateIdx)}>
                                                        {candidate.description} - ${candidate.price.toFixed(2)}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </>
                                    ) : (
                                        <>
                                            <Typography variant="body2">
                                                ${Number(quoteItem.price ?? 0).toFixed(2)} (aprox)
                                            </Typography>
                                            {quoteItem.matchedDescription && (
                                                <Typography variant="caption" color="text.secondary">
                                                    {quoteItem.matchedDescription}
                                                </Typography>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
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
                )})
            )}

            {quoteResponse && (
                <Typography variant="h6" sx={{ mt: 2 }}>
                    Total estimado: ${totalUI.toFixed(2)}
                </Typography>
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
