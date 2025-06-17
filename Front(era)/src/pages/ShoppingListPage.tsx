import React, { useEffect, useState } from "react";
import { fetchPendingShoppingLists, fetchHistoryShoppingLists } from "../api/shoppingListApi";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav.tsx";
import FloatingMenu from "../components/FloatingMenu.tsx";

interface ShoppingListSummary {
    id: number;
    name: string;
    createdAt: string;
    completedAt: string | null;
}

const ShoppingListPage: React.FC = () => {
    const [pendingLists, setPendingLists] = useState<ShoppingListSummary[]>([]);
    const [historyLists, setHistoryLists] = useState<ShoppingListSummary[]>([]);
    const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");

    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            fetchPendingShoppingLists(token).then(setPendingLists);
            fetchHistoryShoppingLists(token).then(setHistoryLists);
        }
    }, []);

    const handleViewList = (id: number) => {
        navigate(`/shopping-list/${id}`);
    };

    return (
        <>
            <button
                onClick={() => navigate('/home')}
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
        <div style={{ padding: "1rem", maxWidth: "800px", margin: "auto" }}>
            <h2 style={{ fontSize: "2rem", marginBottom: "1rem", marginTop: "2.5rem"  }}>🛒 Shopping Lists</h2>

            <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
                <button
                    onClick={() => setActiveTab("pending")}
                    style={{
                        fontWeight: activeTab === "pending" ? "bold" : "normal",
                        padding: "0.5rem 1rem",
                        borderRadius: "6px",
                        border: "1px solid #ccc",
                        background: activeTab === "pending" ? "#A6B240" : "#f9f9f9",
                        color: activeTab === "pending" ? "white" : "black"
                    }}
                >
                    Pendientes
                </button>
                <button
                    onClick={() => setActiveTab("history")}
                    style={{
                        fontWeight: activeTab === "history" ? "bold" : "normal",
                        padding: "0.5rem 1rem",
                        borderRadius: "6px",
                        border: "1px solid #ccc",
                        background: activeTab === "history" ? "#A6B240" : "#f9f9f9",
                        color: activeTab === "history" ? "white" : "black"
                    }}
                >
                    Historial
                </button>
            </div>

            {activeTab === "pending" ? (
                pendingLists.length === 0 ? (
                    <p>No tenés listas pendientes.</p>
                ) : (
                    pendingLists.map(list => (
                        <div key={list.id}
                             style={{
                                 border: "1px solid #ccc",
                                 padding: "1rem",
                                 marginBottom: "1rem",
                                 borderRadius: "10px",
                                 background: "#fefefe",
                                 cursor: "pointer",
                                 boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
                             }}
                             onClick={() => handleViewList(list.id)}>
                            <h4 style={{ margin: 0 }}>{list.name}</h4>
                            <small style={{ color: "#666" }}>Creado: {new Date(list.createdAt).toLocaleString()}</small>
                        </div>
                    ))
                )
            ) : (
                historyLists.length === 0 ? (
                    <p>No hay listas en el historial.</p>
                ) : (
                    historyLists.map(list => (
                        <div key={list.id}
                             style={{
                                 border: "1px solid #ccc",
                                 padding: "1rem",
                                 marginBottom: "1rem",
                                 borderRadius: "10px",
                                 background: "#fefefe",
                                 cursor: "pointer",
                                 boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
                             }}
                             onClick={() => handleViewList(list.id)}>
                            <h4 style={{ margin: 0 }}>{list.name}</h4>
                            <small style={{ color: "#666" }}>Completado: {list.completedAt ? new Date(list.completedAt).toLocaleString() : "-"}</small>
                        </div>
                    ))
                )
            )}
            <FloatingMenu />
            <BottomNav />
        </div>
      </>
    );
};

export default ShoppingListPage;
