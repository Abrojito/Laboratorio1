import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { fetchRecipes, Recipe } from '../api/recipeApi';
import { fetchMealPreps } from '../api/mealPrepApi';
import { MealPrep } from '../types/MealPrep';
import MealPrepCard from '../components/MealPrepCard';
import BottomNav from '../components/BottomNav';
import FloatingMenu from '../components/FloatingMenu';
import '../App.css';

interface User {
    id: number;
    username: string;
    fullName: string;
}

const Home: React.FC = () => {
    const [user] = useState<User | null>({
        username: 'JohnDoe',
        fullName: 'John Doe',
        id: 1
    });

    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [mealPreps, setMealPreps] = useState<MealPrep[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    useEffect(() => {
        const loadData = async () => {
            try {
                const [recipesData, mealPrepsData] = await Promise.all([
                    fetchRecipes(),
                    fetchMealPreps()
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

    const handleViewRecipe = (id: number) => {
        navigate(`/recipes/${id}`);
    };

    if (!user) return <div>Cargando usuario…</div>;
    if (loading) return <div>Cargando datos…</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <header style={styles.header}>
                <h1 style={styles.logo}>D<span style={{ color: '#A6B240' }}>.</span></h1>
                <button onClick={() => navigate('/search/users')} style={styles.searchButton}>
                    🔍
                </button>
            </header>

            <main style={styles.main}>
                <h2>Recetas</h2>
                {recipes.length === 0 ? (
                    <p>No hay recetas todavía.</p>
                ) : (
                    <div style={styles.grid}>
                        {recipes.map((r) => (
                            <div
                                key={r.id}
                                style={styles.card}
                                onClick={() => handleViewRecipe(r.id)}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                <img
                                    src={r.image || '/default-recipe.png'}
                                    alt={r.name}
                                    style={styles.image}
                                />
                                <h3 style={styles.cardTitle}>{r.name}</h3>
                                <p style={styles.cardDesc}>{r.description}</p>
                            </div>
                        ))}
                    </div>
                )}

                <h2 style={{ marginTop: '3rem' }}>Meal Preps</h2>
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

const styles: Record<string, React.CSSProperties> = {
    header: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1rem', backgroundColor: '#030303', color: '#ffffff',
        width: '100vw', height: '10vh',
    },
    logo: {
        fontFamily: 'Libre Caslon Text, serif', fontSize: '2.5rem'
    },
    searchButton: {
        background: 'none',
        border: 'none',
        fontSize: '1.5rem',
        color: '#ffffff',
        cursor: 'pointer'
    },
    main: {
        padding: '2rem', maxWidth: '1200px', margin: '0 auto'
    },
    grid: {
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem'
    },
    card: {
        background: '#f8f8f8', padding: '1rem', borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)', textAlign: 'center',
        cursor: 'pointer', transition: 'transform 0.2s',
    },
    image: {
        width: '100%', height: '200px', objectFit: 'cover',
        borderRadius: '8px', marginBottom: '1rem'
    },
    cardTitle: {
        fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem'
    },
    cardDesc: {
        fontSize: '0.9rem', color: '#555'
    }
};

export default Home;
