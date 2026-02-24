import React, { useEffect, useState } from "react";
import { searchMealPrepsCursor } from "../api/mealPrepApi.ts";
import { searchRecipesCursor } from "../api/recipeApi.ts";
import { useNavigate } from "react-router-dom";
import { MealPrep } from "../types/MealPrep";
import { RecipeSearchResult } from "../types/Recipe";
import RecipeSearchCard from "../components/RecipeSearchCard";
import BottomNav from "../components/BottomNav.tsx";
import FloatingMenu from "../components/FloatingMenu.tsx";
import { useCursorPagination } from "../hooks/useCursorPagination.ts";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";

const SearchPage: React.FC = () => {
    const [searchType, setSearchType] = useState<"recipes" | "mealpreps">("recipes");
    const [name, setName] = useState("");
    const [ingredient, setIngredient] = useState("");
    const [author, setAuthor] = useState("");
    const [hasSearched, setHasSearched] = useState(false);
    const navigate = useNavigate();
    const [onlyFollowing, setOnlyFollowing] = useState(false);
    const [excludeUndesired, setExcludeUndesired] = useState(true);
    const [activeSearch, setActiveSearch] = useState<{
        enabled: boolean;
        type: "recipes" | "mealpreps";
        name: string;
        ingredient: string;
        author: string;
        onlyFollowing: boolean;
        excludeUndesired: boolean;
    }>({
        enabled: false,
        type: "recipes",
        name: "",
        ingredient: "",
        author: "",
        onlyFollowing: false,
        excludeUndesired: true,
    });

    const {
        items: recipeResults,
        loadMore: loadMoreRecipes,
        isLoading: recipesLoading,
        hasNext: hasMoreRecipes,
        error: recipesError,
        reset: resetRecipes,
    } = useCursorPagination<RecipeSearchResult>(async (cursor) => {
        if (!activeSearch.enabled || activeSearch.type !== "recipes") {
            return { items: [], nextCursor: null, hasNext: false };
        }

        const page = await searchRecipesCursor(
            {
                name: activeSearch.name,
                ingredient: activeSearch.ingredient,
                author: activeSearch.author,
                onlyFollowing: activeSearch.onlyFollowing,
                excludeUndesired: activeSearch.excludeUndesired,
            },
            cursor,
            6
        );
        return page;
    });

    const {
        items: mealPrepResults,
        loadMore: loadMoreMealPreps,
        isLoading: mealPrepsLoading,
        hasNext: hasMoreMealPreps,
        error: mealPrepsError,
        reset: resetMealPreps,
    } = useCursorPagination<MealPrep>(async (cursor) => {
        if (!activeSearch.enabled || activeSearch.type !== "mealpreps") {
            return { items: [], nextCursor: null, hasNext: false };
        }

        return searchMealPrepsCursor(
            {
                name: activeSearch.name,
                ingredient: activeSearch.ingredient,
                author: activeSearch.author,
                onlyFollowing: activeSearch.onlyFollowing,
                excludeUndesired: activeSearch.excludeUndesired,
            },
            cursor,
            6
        );
    });

    const handleSearch = async () => {

        if (!name.trim() && !ingredient.trim() && !author.trim()) {
            return;
        }

        setHasSearched(true);

        setActiveSearch({
            enabled: true,
            type: searchType,
            name,
            ingredient,
            author,
            onlyFollowing,
            excludeUndesired,
        });
    };


    useEffect(() => {
        if (!hasSearched) return;
        handleSearch();
    }, [searchType]);

    useEffect(() => {
        if (!hasSearched) return;
        handleSearch();
    }, [onlyFollowing, excludeUndesired]);

    useEffect(() => {
        if (!activeSearch.enabled) return;
        resetRecipes();
        resetMealPreps();
    }, [activeSearch, resetRecipes, resetMealPreps]);

    useEffect(() => {
        if (!import.meta.env.DEV || recipeResults.length === 0) return;
        console.log("[Search][recipes][first]", recipeResults[0]);
    }, [recipeResults]);

    useEffect(() => {
        if (!import.meta.env.DEV || mealPrepResults.length === 0) return;
        console.log("[Search][mealpreps][first]", mealPrepResults[0]);
    }, [mealPrepResults]);

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
            <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1rem", marginTop: "2.5rem" }}>
                🔍 Buscador
            </h1>

            <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
                <button
                    onClick={() => setSearchType("recipes")}
                    style={{
                        padding: "0.5rem 1rem",
                        borderRadius: "5px",
                        border: "none",
                        backgroundColor: searchType === "recipes" ? "#A6B240" : "#ccc",
                        color: "white",
                        cursor: "pointer"
                    }}
                >
                    Recetas
                </button>
                <button
                    onClick={() => setSearchType("mealpreps")}
                    style={{
                        padding: "0.5rem 1rem",
                        borderRadius: "5px",
                        border: "none",
                        backgroundColor: searchType === "mealpreps" ? "#A6B240" : "#ccc",
                        color: "white",
                        cursor: "pointer"
                    }}
                >
                    Meal Preps
                </button>
            </div>

            <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
                marginBottom: "1.5rem"
            }}>
                <input
                    type="text"
                    placeholder="Nombre"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    style={{
                        padding: "0.5rem",
                        borderRadius: "6px",
                        border: "1px solid #ccc"
                    }}
                />
                <input
                    type="text"
                    placeholder="Ingrediente"
                    value={ingredient}
                    onChange={e => setIngredient(e.target.value)}
                    style={{
                        padding: "0.5rem",
                        borderRadius: "6px",
                        border: "1px solid #ccc"
                    }}
                />
                <input
                    type="text"
                    placeholder="Autor"
                    value={author}
                    onChange={e => setAuthor(e.target.value)}
                    style={{
                        padding: "0.5rem",
                        borderRadius: "6px",
                        border: "1px solid #ccc"
                    }}
                />
                <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", marginTop: "0.25rem" }}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={onlyFollowing}
                                onChange={(e) => setOnlyFollowing(e.target.checked)}
                            />
                        }
                        label="Solo de seguidos"
                    />
                    <FormControlLabel
                        control={
                            <Switch
                                checked={excludeUndesired}
                                onChange={(e) => setExcludeUndesired(e.target.checked)}
                            />
                        }
                        label="Excluir no deseados"
                    />
                </div>
                <button
                    onClick={handleSearch}
                    disabled={!name.trim() && !ingredient.trim() && !author.trim()}
                    style={{
                        marginTop: "0.5rem",
                        padding: "0.6rem 1rem",
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer"
                    }}
                >
                    Buscar
                </button>
            </div>

            {hasSearched && (
                (() => {
                    const results = searchType === "recipes" ? recipeResults : mealPrepResults;
                    const loading = searchType === "recipes" ? recipesLoading : mealPrepsLoading;
                    const error = searchType === "recipes" ? recipesError : mealPrepsError;
                    const hasMore = searchType === "recipes" ? hasMoreRecipes : hasMoreMealPreps;
                    const loadMore = searchType === "recipes" ? loadMoreRecipes : loadMoreMealPreps;

                    if (loading && results.length === 0) return <p>Cargando resultados...</p>;
                    if (error) return <p>{error}</p>;
                    if (results.length === 0) return <p>No se encontraron resultados.</p>;

                    return (
                        <>
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                                gap: "1.5rem"
                            }}>
                                {results.map((item: any) =>
                                    searchType === "recipes" ? (
                                        <RecipeSearchCard key={item.id} recipe={item} />
                                    ) : (
                                        <div
                                            key={item.id}
                                            onClick={() => navigate(`/mealpreps/${item.id}`)}
                                            style={{
                                                border: "1px solid #ddd",
                                                borderRadius: "12px",
                                                overflow: "hidden",
                                                cursor: "pointer",
                                                boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
                                            }}
                                        >
                                            <img src={item.image} alt={item.name}
                                                 style={{ width: "100%", height: "180px", objectFit: "cover" }} />
                                            <div style={{ padding: "1rem" }}>
                                                <h3 style={{ margin: 0 }}>{item.name}</h3>
                                                <p style={{ color: "#555", fontSize: "0.9rem" }}>
                                                    {item.description?.slice(0, 80)}...
                                                </p>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                            {hasMore && (
                                <button
                                    onClick={loadMore}
                                    disabled={loading}
                                    style={{
                                        marginTop: "1rem",
                                        padding: "0.6rem 1rem",
                                        backgroundColor: "#A6B240",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "5px",
                                        cursor: "pointer"
                                    }}
                                >
                                    {loading ? "Cargando..." : "Cargar más"}
                                </button>
                            )}
                        </>
                    );
                })()
            )}
            <FloatingMenu />
            <BottomNav />

        </div>
       </>
    );
};

export default SearchPage;
