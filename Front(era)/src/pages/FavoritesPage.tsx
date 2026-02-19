import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import FavoriteIcon from "@mui/icons-material/Favorite";

import {
    fetchFavRecipesCursorPage,
    fetchFavMealPrepsCursorPage,
    removeFavorite,
    removeMealPrepFavorite
} from "../api/favoriteApi";
import { Recipe } from "../types/Recipe";
import { MealPrep } from "../types/MealPrep";
import { useCursorPagination } from "../hooks/useCursorPagination";

import RecipeCard from "../components/RecipeCard";
import MealPrepCard from "../components/MealPrepCard";

const FavoritesPage: React.FC = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem("token") || "";

    /* ---------- Recetas favoritas ---------- */
    const {
        items: favRecipes,
        loadMore: loadMoreRecipes,
        isLoading: recipesLoading,
        hasNext: hasMoreR,
        error: recipesError,
    } = useCursorPagination<Recipe>((cursor) =>
        token
            ? fetchFavRecipesCursorPage(cursor, 4, token)
            : Promise.resolve({ items: [], nextCursor: null, hasNext: false })
    );

    /* ---------- Meal-preps favoritas ---------- */
    const {
        items: favMPs,
        loadMore: loadMoreMealPreps,
        isLoading: mealPrepsLoading,
        hasNext: hasMoreMP,
        error: mealPrepsError,
    } = useCursorPagination<MealPrep>((cursor) =>
        token
            ? fetchFavMealPrepsCursorPage(cursor, 4, token)
            : Promise.resolve({ items: [], nextCursor: null, hasNext: false })
    );

    const [removedRecipeIds, setRemovedRecipeIds] = useState<number[]>([]);
    const [removedMealPrepIds, setRemovedMealPrepIds] = useState<number[]>([]);

    const visibleRecipes = favRecipes.filter(r => !removedRecipeIds.includes(r.id));
    const visibleMealPreps = favMPs.filter(mp => !removedMealPrepIds.includes(mp.id));

    const loading =
        (recipesLoading && favRecipes.length === 0) ||
        (mealPrepsLoading && favMPs.length === 0);
    const error = recipesError || mealPrepsError;

    const handleRemoveRecipe = async (recipeId: number) => {
        try {
            await removeFavorite(recipeId);
            setRemovedRecipeIds(prev => (prev.includes(recipeId) ? prev : [...prev, recipeId]));
        } catch (err) {
            console.error("Error quitando receta de favoritos", err);
        }
    };

    const handleRemoveMealPrep = async (mealPrepId: number) => {
        try {
            await removeMealPrepFavorite(mealPrepId);
            setRemovedMealPrepIds(prev => (prev.includes(mealPrepId) ? prev : [...prev, mealPrepId]));
        } catch (err) {
            console.error("Error quitando meal prep de favoritos", err);
        }
    };

    /* redirect si no hay token */
    useEffect(() => { if (!token) navigate("/start"); }, [token, navigate]);

    if (loading) return <p style={{ padding: "2rem" }}>Cargando…</p>;
    if (error)   return <p style={{ padding: "2rem" }}>{error}</p>;

    return (
        <>
            <button onClick={() => navigate("/profile")} style={styles.backBtn}>←</button>

            <div style={styles.container}>
                <h1 style={styles.title}>Mis favoritos</h1>

                {/* recetas */}
                {visibleRecipes.length > 0 && (
                    <>
                        <h2 style={styles.subTitle}>Recetas</h2>
                        <div style={styles.grid}>
                            {visibleRecipes.map(r => (
                                <div key={`r-${r.id}`} style={styles.cardWrap}>
                                    <IconButton
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveRecipe(r.id);
                                        }}
                                        style={styles.removeBtn}
                                    >
                                        <FavoriteIcon />
                                    </IconButton>
                                    <RecipeCard recipe={r} />
                                </div>
                            ))}
                        </div>
                        {hasMoreR && (
                            <button style={styles.loadBtn} onClick={loadMoreRecipes} disabled={recipesLoading}>
                                {recipesLoading ? "Cargando..." : "Cargar más"}
                            </button>
                        )}
                    </>
                )}

                {/* meal-preps */}
                {visibleMealPreps.length > 0 && (
                    <>
                        <h2 style={styles.subTitle}>Meal Preps</h2>
                        <div style={styles.grid}>
                            {visibleMealPreps.map(mp => (
                                <div key={`mp-${mp.id}`} style={styles.cardWrap}>
                                    <IconButton
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveMealPrep(mp.id);
                                        }}
                                        style={styles.removeBtn}
                                    >
                                        <FavoriteIcon />
                                    </IconButton>
                                    <MealPrepCard mealPrep={mp} />
                                </div>
                            ))}
                        </div>
                        {hasMoreMP && (
                            <button style={styles.loadBtn} onClick={loadMoreMealPreps} disabled={mealPrepsLoading}>
                                {mealPrepsLoading ? "Cargando..." : "Cargar más"}
                            </button>
                        )}
                    </>
                )}

                {visibleRecipes.length === 0 && visibleMealPreps.length === 0 && !loading && (
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
    cardWrap: {
        position: "relative",
    },
    removeBtn: {
        position: "absolute",
        top: 10,
        right: 10,
        zIndex: 3,
        color: "#d32f2f",
        backgroundColor: "rgba(255,255,255,0.9)",
    },
    loadBtn: {
        margin: "1.5rem auto", display: "block",
        padding: "0.6rem 1.2rem", backgroundColor: "#A6B240", color: "#fff",
        border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: 600,
    },
};

export default FavoritesPage;
