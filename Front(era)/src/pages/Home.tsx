import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { fetchRecipesPage } from "../api/recipeApi";
import { fetchMealPrepsPage } from "../api/mealPrepApi";
import { MealPrep } from "../types/MealPrep";
import { Recipe } from "../types/Recipe";

import RecipeCard from "../components/RecipeCard";
import MealPrepCard from "../components/MealPrepCard";
import BottomNav from "../components/BottomNav";
import FloatingMenu from "../components/FloatingMenu";

import "../App.css";

const Home: React.FC = () => {
    /* ---------- recetas paginadas ---------- */
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [pageR, setPageR] = useState(0);
    const [hasMoreR, setHasMoreR] = useState(true);

    /* ---------- meal-preps paginadas ---------- */
    const [mealPreps, setMealPreps] = useState<MealPrep[]>([]);
    const [pageMP, setPageMP] = useState(0);
    const [hasMoreMP, setHasMoreMP] = useState(true);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    /* ---------- Recetas paginadas ---------- */
    useEffect(() => {
        fetchRecipesPage(pageR)            // size = 3
            .then(p => {
                setRecipes(prev =>
                    pageR === 0 ? p.content : [...prev, ...p.content]
                );
                setHasMoreR(pageR + 1 < p.totalPages);
            })
            .catch(() => setError("Error cargando recetas"))
            .finally(() => {
                // solo apagamos el spinner cuando cargó la primera tanda
                if (pageR === 0) setLoading(false);
            });
    }, [pageR]);

    /* ---------- Meal-preps paginadas ---------- */
    useEffect(() => {
        fetchMealPrepsPage(pageMP)         // size = 3
            .then(p => {
                setMealPreps(prev =>
                    pageMP === 0 ? p.content : [...prev, ...p.content]
                );
                setHasMoreMP(pageMP + 1 < p.totalPages);
            })
            .catch(() => setError("Error cargando meal preps"))
            .finally(() => {
                if (pageMP === 0) setLoading(false);
            });
    }, [pageMP]);


    if (loading) return <p style={{ padding: "2rem" }}>Cargando…</p>;
    if (error)   return <p style={{ padding: "2rem" }}>{error}</p>;

    return (
        <div>
            {/* ------------- Header ------------- */}
            <header style={styles.header}>
                <h1 style={styles.logo}>
                    D<span style={{ color: "#A6B240" }}>.</span>
                </h1>
                <button
                    onClick={() => navigate("/search/users")}
                    style={styles.searchButton}
                >
                    🔍
                </button>
            </header>

            {/* ------------- Main ------------- */}
            <main style={styles.main}>
                {/* === Recetas === */}
                <h2>Recetas</h2>
                {recipes.length === 0 ? (
                    <p>No hay recetas todavía.</p>
                ) : (
                    <>
                        <div style={styles.grid}>
                            {recipes.map((r) => (
                                <RecipeCard key={r.id} recipe={r} />
                            ))}
                        </div>
                        {hasMoreR && (
                            <button
                                style={styles.loadBtn}
                                onClick={() => setPageR((p) => p + 1)}
                            >
                                Ver más recetas
                            </button>
                        )}
                    </>
                )}

                {/* === Meal Preps === */}
                <h2 style={{ marginTop: "3rem" }}>Meal Preps</h2>
                {mealPreps.length === 0 ? (
                    <p>No hay meal preps todavía.</p>
                ) : (
                    <>
                        <div style={styles.grid}>
                            {mealPreps.map((mp) => (
                                <MealPrepCard key={mp.id} mealPrep={mp} />
                            ))}
                        </div>
                        {hasMoreMP && (
                            <button
                                style={styles.loadBtn}
                                onClick={() => setPageMP((p) => p + 1)}
                            >
                                Ver más meal preps
                            </button>
                        )}
                    </>
                )}
            </main>

            <FloatingMenu />
            <BottomNav />
        </div>
    );
};

/* ---------- estilos inline ---------- */
const styles: Record<string, React.CSSProperties> = {
    header: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "1rem",
        backgroundColor: "#030303",
        color: "#fff",
        width: "100vw",
        height: "10vh",
    },
    logo: {
        fontFamily: "Libre Caslon Text, serif",
        fontSize: "2.5rem",
    },
    searchButton: {
        background: "none",
        border: "none",
        fontSize: "1.5rem",
        color: "#fff",
        cursor: "pointer",
    },
    main: {
        padding: "2rem",
        maxWidth: "1200px",
        margin: "0 auto",
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "1.5rem",
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

export default Home;
