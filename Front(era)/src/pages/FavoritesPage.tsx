import React, { useEffect, useState } from 'react';
import RecipeCard from '../components/RecipeCard';
import { Recipe } from '../api/recipeApi';
import { MealPrep } from '../types/MealPrep';
import MealPrepCard from "../components/MealPrepCard.tsx";
import {useNavigate} from "react-router-dom";

const FavoritesPage = () => {
    const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([]);
    const [favoriteMealPreps, setFavoriteMealPreps] = useState<MealPrep[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        Promise.all([
            fetch("http://localhost:8080/api/favorites/recipes", {
                headers: { Authorization: `Bearer ${token}` }
            }).then(res => res.json()),
            fetch("http://localhost:8080/api/favorites/mealpreps", {
                headers: { Authorization: `Bearer ${token}` }
            }).then(res => res.json())
        ])
            .then(([recipes, mealpreps]) => {
                setFavoriteRecipes(recipes);
                setFavoriteMealPreps(mealpreps);
            })
            .catch(console.error);
    }, []);

    return (
        <>
            <button
                onClick={() => navigate('/profile')}
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
        <div style={{
            padding: "1.5rem",
            maxWidth: "1200px",
            margin: "0 auto",
            fontFamily: "'Albert Sans', sans-serif"
        }}>
            <h1 style={{
                fontSize: "2rem",
                fontWeight: 700,
                marginTop: "2.5rem",
                marginBottom: "1.5rem",
                color: "#333"
            }}>
                Mis favoritos
            </h1>

            {favoriteRecipes.length === 0 && favoriteMealPreps.length === 0 ? (
                <p style={{ color: "#666", fontSize: "1rem" }}>No tenés favoritos todavía.</p>
            ) : (
                <>
                    {favoriteRecipes.length > 0 && (
                        <>
                            <h2 style={{
                                fontSize: "1.4rem",
                                fontWeight: 600,
                                marginBottom: "1rem",
                                marginTop: "2rem"
                            }}>Recetas</h2>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                                gap: '1.5rem'
                            }}>
                                {favoriteRecipes.map(r => (
                                    <RecipeCard key={`recipe-${r.id}`} recipe={r} />
                                ))}
                            </div>
                        </>
                    )}

                    {favoriteMealPreps.length > 0 && (
                        <>
                            <h2 style={{
                                fontSize: "1.4rem",
                                fontWeight: 600,
                                marginBottom: "1rem",
                                marginTop: "2.5rem"
                            }}>Meal Preps</h2>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                                gap: '1.5rem'
                            }}>
                                {favoriteMealPreps.map(mp => (
                                    <MealPrepCard key={`mealprep-${mp.id}`} mealPrep={mp} />
                                ))}
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
       </>
    );
};

export default FavoritesPage;
