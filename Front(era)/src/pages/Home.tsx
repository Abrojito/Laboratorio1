import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { fetchRecipesCursorPage } from "../api/recipeApi";
import { fetchMealPrepsCursorPage } from "../api/mealPrepApi";
import { MealPrep } from "../types/MealPrep";
import { Recipe } from "../types/Recipe";
import { useCursorPagination } from "../hooks/useCursorPagination";

import RecipeCard from "../components/RecipeCard";
import MealPrepCard from "../components/MealPrepCard";
import BottomNav from "../components/BottomNav";
import FloatingMenu from "../components/FloatingMenu";

import "../App.css";

const Home: React.FC = () => {
    /* ---------- recetas con cursor ---------- */
    const {
        items: recipes,
        loadMore: loadMoreRecipes,
        isLoading: recipesLoading,
        hasNext: hasMoreR,
        error: recipesError,
    } = useCursorPagination<Recipe>((cursor) => fetchRecipesCursorPage(cursor, 3));

    /* ---------- meal-preps con cursor ---------- */
    const {
        items: mealPreps,
        loadMore: loadMoreMealPreps,
        isLoading: mealPrepsLoading,
        hasNext: hasMoreMP,
        error: mealPrepsError,
    } = useCursorPagination<MealPrep>((cursor) => fetchMealPrepsCursorPage(cursor, 3));

    const navigate = useNavigate();
    const loading = (recipesLoading && recipes.length === 0) || (mealPrepsLoading && mealPreps.length === 0);
    const error = recipesError || mealPrepsError;

    useEffect(() => {
        if (!import.meta.env.DEV || recipes.length === 0) return;
        console.log("[Home][recipes][first]", recipes[0]);
    }, [recipes]);

    useEffect(() => {
        if (!import.meta.env.DEV || mealPreps.length === 0) return;
        console.log("[Home][mealpreps][first]", mealPreps[0]);
    }, [mealPreps]);

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
                {loading || error ? (
                    <>
                        {loading && <p style={{ padding: "2rem" }}>Cargando…</p>}
                        {error && <p style={{ padding: "2rem" }}>{error}</p>}
                    </>
                ) : (
                    <>
                        {/* === Recetas === */}
                        <h2>Recetas</h2>
                        {recipes.length === 0 ? (
                            recipesLoading ? <p>Cargando recetas...</p> : <p>No hay recetas todavía.</p>
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
                                        onClick={loadMoreRecipes}
                                        disabled={recipesLoading}
                                    >
                                        {recipesLoading ? "Cargando..." : "Cargar más"}
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
                                        onClick={loadMoreMealPreps}
                                        disabled={mealPrepsLoading}
                                    >
                                        {mealPrepsLoading ? "Cargando..." : "Cargar más"}
                                    </button>
                                )}
                            </>
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
