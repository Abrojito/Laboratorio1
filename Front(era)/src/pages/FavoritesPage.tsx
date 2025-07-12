import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { fetchFavRecipesPage, fetchFavMealPrepsPage } from "../api/favoriteApi";
import { Recipe } from "../types/Recipe";
import { MealPrep } from "../types/MealPrep";

import RecipeCard from "../components/RecipeCard";
import MealPrepCard from "../components/MealPrepCard";

const FavoritesPage: React.FC = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem("token") || "";

    /* ---------- Recetas favoritas ---------- */
    const [favRecipes, setFavRecipes] = useState<Recipe[]>([]);
    const [pageR, setPageR] = useState(0);
    const [hasMoreR, setHasMoreR] = useState(true);

    /* ---------- Meal-preps favoritas ---------- */
    const [favMPs, setFavMPs] = useState<MealPrep[]>([]);
    const [pageMP, setPageMP] = useState(0);
    const [hasMoreMP, setHasMoreMP] = useState(true);

    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState<string | null>(null);

    /* redirect si no hay token */
    useEffect(() => { if (!token) navigate("/start"); }, [token, navigate]);

    /* === recetas === */
    useEffect(() => {
        if (!token) return;
        fetchFavRecipesPage(pageR, 6, token)
            .then(p => {
                setFavRecipes(prev => pageR === 0 ? p.content : [...prev, ...p.content]);
                setHasMoreR(pageR + 1 < p.totalPages);
            })
            .catch(() => setError("Error cargando favoritos."))
            .finally(() => setLoading(false));
    }, [pageR, token]);

    /* === meal-preps === */
    useEffect(() => {
        if (!token) return;
        fetchFavMealPrepsPage(pageMP, 6, token)
            .then(p => {
                setFavMPs(prev => pageMP === 0 ? p.content : [...prev, ...p.content]);
                setHasMoreMP(pageMP + 1 < p.totalPages);
            })
            .catch(() => setError("Error cargando favoritos."))
            .finally(() => setLoading(false));
    }, [pageMP, token]);

    if (loading) return <p style={{ padding: "2rem" }}>Cargando…</p>;
    if (error)   return <p style={{ padding: "2rem" }}>{error}</p>;

    return (
        <>
            <button onClick={() => navigate("/profile")} style={styles.backBtn}>←</button>

            <div style={styles.container}>
                <h1 style={styles.title}>Mis favoritos</h1>

                {/* recetas */}
                {favRecipes.length > 0 && (
                    <>
                        <h2 style={styles.subTitle}>Recetas</h2>
                        <div style={styles.grid}>
                            {favRecipes.map(r => <RecipeCard key={`r-${r.id}`} recipe={r} />)}
                        </div>
                        {hasMoreR && (
                            <button style={styles.loadBtn} onClick={() => setPageR(p => p + 1)}>
                                Ver más recetas
                            </button>
                        )}
                    </>
                )}

                {/* meal-preps */}
                {favMPs.length > 0 && (
                    <>
                        <h2 style={styles.subTitle}>Meal Preps</h2>
                        <div style={styles.grid}>
                            {favMPs.map(mp => <MealPrepCard key={`mp-${mp.id}`} mealPrep={mp} />)}
                        </div>
                        {hasMoreMP && (
                            <button style={styles.loadBtn} onClick={() => setPageMP(p => p + 1)}>
                                Ver más meal preps
                            </button>
                        )}
                    </>
                )}

                {favRecipes.length === 0 && favMPs.length === 0 && (
                    <p>No tenés favoritos todavía.</p>
                )}
            </div>
        </>
    );
};

/* ---------- estilos ---------- */
const styles: Record<string, React.CSSProperties> = {
    backBtn: {
        position: "absolute", top: 20, left: 20, zIndex: 999,
        background: "none", border: "none", fontSize: "2rem", cursor: "pointer", color: "#A6B240",
    },
    container: { padding: "2rem", maxWidth: "1200px", margin: "0 auto" },
    title: { fontSize: "2rem", marginBottom: "1.5rem", textAlign: "center" },
    subTitle: { fontSize: "1.4rem", margin: "2rem 0 1rem" },
    grid: {
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px,1fr))", gap: "1.5rem",
    },
    loadBtn: {
        margin: "1.5rem auto", display: "block",
        padding: "0.6rem 1.2rem", backgroundColor: "#A6B240", color: "#fff",
        border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: 600,
    },
};

export default FavoritesPage;
