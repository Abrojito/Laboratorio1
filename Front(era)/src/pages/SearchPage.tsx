import React, { useEffect, useState } from "react";
import { searchMealPreps } from "../api/mealPrepApi.ts";
import { searchRecipes } from "../api/recipeApi.ts";
import { useNavigate } from "react-router-dom";
import { Recipe } from "../types/Recipe";
import { MealPrep } from "../types/MealPrep";
import { RecipeSearchResult } from "../types/Recipe";
import RecipeSearchCard from "../components/RecipeSearchCard";
import BottomNav from "../components/BottomNav.tsx";
import FloatingMenu from "../components/FloatingMenu.tsx";

interface Ingredient {
    id: number;
    name: string;
}

const SearchPage: React.FC = () => {
    const [searchType, setSearchType] = useState<"recipes" | "mealpreps">("recipes");
    const [name, setName] = useState("");
    const [ingredient, setIngredient] = useState("");
    const [author, setAuthor] = useState("");
    const [results, setResults] = useState<(RecipeSearchResult | MealPrep)[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const navigate = useNavigate();
    const [filterUndesired, setFilterUndesired] = useState(true);
    const [undesiredIngredients, setUndesiredIngredients] = useState<Ingredient[]>([]);


    const handleSearch = async () => {

        if (!name.trim() && !ingredient.trim() && !author.trim()) {
            return;
        }

        setLoading(true);
        setHasSearched(true);

        const token = localStorage.getItem("token") || "";

        if (filterUndesired){
            const undesired = async () => {
                try {
                    const res = await fetch("http://localhost:8080/api/undesired", {
                        headers: {Authorization: `Bearer ${token}`},
                    });
                    if (!res.ok) throw new Error("Error al cargar lista");
                    const data = await res.json();
                    setUndesiredIngredients(data);
                } catch (err) {
                    console.error(err);
                }
            }
            await undesired();
        }
        try {
            if (searchType === "recipes") {
                const data: Recipe[] = await searchRecipes({ name, ingredient, author });
                const bannedIds = new Set(undesiredIngredients.map(ing => ing.id));
                const allowedRecipes = data.filter(recipe => {
                    return recipe.ingredients.every(i=> !bannedIds.has(i.ingredientId));
                })
                setResults(allowedRecipes as RecipeSearchResult[]);

            } else {
                const data: MealPrep[] = await searchMealPreps({ name, ingredient, author });
                setResults(data);
            }
        } catch (err) {
            console.error("Error al buscar:", err);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        handleSearch();
    }, [searchType]);

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
                loading ? (
                    <p>Cargando resultados...</p>
                ) : (
                    <>
                        {results.length === 0 ? (
                            <p>No se encontraron resultados.</p>
                        ) : (
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
                        )}
                    </>
                )
            )}
            <FloatingMenu />
            <BottomNav />

        </div>
       </>
    );
};

export default SearchPage;
