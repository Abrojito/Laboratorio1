import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { fetchRecipes} from "../api/recipeApi";
import { fetchMealPreps } from "../api/mealPrepApi";
import { MealPrep } from "../types/MealPrep";
import { Recipe } from "../types/Recipe";

import RecipeCard from "../components/RecipeCard";
import MealPrepCard from "../components/MealPrepCard";
import BottomNav from "../components/BottomNav";
import FloatingMenu from "../components/FloatingMenu";

import "../App.css";

interface User {
    id: number;
    username: string;
    fullName: string;
}

const Home: React.FC = () => {
    /* --- estado ------------------------------------------------------------------- */
    const [user] = useState<User | null>({
        username: "JohnDoe",
        fullName: "John Doe",
        id: 1,
    });

    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [mealPreps, setMealPreps] = useState<MealPrep[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    /* --- carga de datos ----------------------------------------------------------- */
    useEffect(() => {
        const loadData = async () => {
            try {
                const [recipesData, mealPrepsData] = await Promise.all([
                    fetchRecipes(),
                    fetchMealPreps(),
                ]);
                setRecipes(recipesData);
                setMealPreps(mealPrepsData);
            } catch (err) {
                setError("Error cargando datos.");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    /* --- render ------------------------------------------------------------------- */
    if (!user) return <div>Cargando usuario…</div>;
    if (loading) return <div>Cargando datos…</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            {/* Header --------------------------------------------------------- */}
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

            {/* Contenido principal ------------------------------------------- */}
            <main style={styles.main}>
                {/* ---- Recetas ---- */}
                <h2>Recetas</h2>
                {recipes.length === 0 ? (
                    <p>No hay recetas todavía.</p>
                ) : (
                    <div style={styles.grid}>
                        {recipes.map((r) => (
                            <RecipeCard key={r.id} recipe={r} />
                        ))}
                    </div>
                )}

                {/* ---- Meal Preps ---- */}
                <h2 style={{ marginTop: "3rem" }}>Meal Preps</h2>
                {mealPreps.length === 0 ? (
                    <p>No hay meal preps todavía.</p>
                ) : (
                    <div style={styles.grid}>
                        {mealPreps.map((mp) => (
                            <MealPrepCard key={mp.id} mealPrep={mp} />
                        ))}
                    </div>
                )}
            </main>

            <FloatingMenu />
            <BottomNav />
        </div>
    );
};

/* --- estilos in-file ----------------------------------------------------------- */
const styles: Record<string, React.CSSProperties> = {
    header: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "1rem",
        backgroundColor: "#030303",
        color: "#ffffff",
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
        color: "#ffffff",
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
};

export default Home;
