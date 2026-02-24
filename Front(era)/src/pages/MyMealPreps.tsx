import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { fetchMyMealPrepsPage, deleteMealPrep } from "../api/mealPrepApi";
import { MealPrep } from "../types/MealPrep";
import { useModal } from "../context/ModalContext";

const MyMealPreps: React.FC = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem("token") || "";
    const { confirm, alert } = useModal();

    /* paginación */
    const [mealPreps, setMealPreps] = useState<MealPrep[]>([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    /* redirect si no hay token */
    useEffect(() => {
        if (!token) navigate("/start");
    }, [token, navigate]);

    /* carga paginada */
    useEffect(() => {
        if (!token) return;

        fetchMyMealPrepsPage(page, 6, token)
            .then(p => {
                setMealPreps(prev =>
                    page === 0 ? p.content : [...prev, ...p.content]
                );
                setHasMore(page + 1 < p.totalPages);
            })
            .catch(() => setError("Error cargando tus meal preps."))
            .finally(() => setLoading(false));
    }, [page, token]);

    /* handlers -------------------------------------------------- */
    const handleViewMealPrep = (id: number) => navigate(`/mealpreps/${id}`);

    const handleEditMealPrep = (id: number) => navigate(`/mealpreps/${id}/edit`);

    const handleDeleteMealPrep = async (id: number) => {
        if (!token) return;
        const ok = await confirm({
            title: "Eliminar meal prep",
            message: "¿Estás seguro que querés eliminar este meal prep?",
            confirmText: "Eliminar",
            cancelText: "Cancelar",
        });
        if (!ok) return;
        try {
            await deleteMealPrep(id, token);
            setMealPreps(prev => prev.filter(mp => mp.id !== id));
        } catch {
            await alert({ title: "Meal Preps", message: "No se pudo eliminar el meal prep." });
        }
    };

    /* render ----------------------------------------------------- */
    if (loading) return <p style={{ padding: "2rem" }}>Cargando…</p>;
    if (error)   return <p style={{ padding: "2rem" }}>{error}</p>;

    return (
        <>
            <button onClick={() => navigate("/profile")} style={styles.backBtn}>←</button>

            <div style={styles.container}>
                <h2 style={styles.title}>Mis Meal Preps</h2>

                {mealPreps.length === 0 ? (
                    <p>No tenés meal preps creados.</p>
                ) : (
                    <>
                        <div style={styles.grid}>
                            {mealPreps.map(mp => (
                                <div key={mp.id} style={styles.card}>
                                    <button
                                        style={styles.deleteButton}
                                        title="Eliminar meal prep"
                                        onClick={() => handleDeleteMealPrep(mp.id)}
                                    >
                                        ×
                                    </button>

                                    <div onClick={() => handleViewMealPrep(mp.id)} style={{ cursor: "pointer" }}>
                                        <img
                                            src={mp.image || "/default-recipe.png"}
                                            alt={mp.name}
                                            style={styles.image}
                                        />
                                        <h3 style={styles.cardTitle}>{mp.name}</h3>
                                        <p style={styles.cardDesc}>{mp.description}</p>
                                    </div>

                                    <button onClick={() => handleEditMealPrep(mp.id)} style={styles.editBtn}>
                                        ✏️ Editar
                                    </button>
                                </div>
                            ))}
                        </div>

                        {hasMore && (
                            <button style={styles.loadBtn} onClick={() => setPage(p => p + 1)}>
                                Ver más meal preps
                            </button>
                        )}
                    </>
                )}
            </div>
        </>
    );
};

/* -------- estilos -------- */
const styles: Record<string, React.CSSProperties> = {
    backBtn: {
        background: "none",
        border: "none",
        fontSize: "2rem",
        cursor: "pointer",
        color: "#A6B240",
        position: "absolute",
        top: "20px",
        left: "20px",
        zIndex: 999,
    },
    container: {
        padding: "2rem",
        maxWidth: "1200px",
        margin: "0 auto",
    },
    title: {
        fontSize: "2rem",
        marginBottom: "1rem",
        textAlign: "center",
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "1.5rem",
    },
    card: {
        position: "relative",
        background: "#f8f8f8",
        padding: "1rem",
        borderRadius: "10px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        textAlign: "center",
    },
    deleteButton: {
        position: "absolute",
        top: "10px",
        right: "10px",
        background: "#ff4d4d",
        color: "#fff",
        border: "none",
        borderRadius: "50%",
        width: "25px",
        height: "25px",
        cursor: "pointer",
        fontSize: "1rem",
        lineHeight: "25px",
        textAlign: "center",
        zIndex: 2,
    },
    image: {
        width: "100%",
        height: "200px",
        objectFit: "cover",
        borderRadius: "8px",
        marginBottom: "1rem",
    },
    cardTitle: {
        fontSize: "1.2rem",
        fontWeight: 600,
        marginBottom: "0.5rem",
    },
    cardDesc: {
        fontSize: "0.9rem",
        color: "#555",
    },
    editBtn: {
        marginTop: "0.5rem",
        background: "#007bff",
        color: "#fff",
        border: "none",
        padding: "0.4rem 0.8rem",
        borderRadius: "5px",
        cursor: "pointer",
    },
    loadBtn: {
        margin: "1.5rem auto",
        display: "block",
        padding: "0.6rem 1.2rem",
        backgroundColor: "#A6B240",
        color: "#fff",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        fontWeight: 600,
    },
};

export default MyMealPreps;
