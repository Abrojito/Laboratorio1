import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchRecipes, Recipe } from '../api/recipeApi';
import '../App.css';

interface User {
    id: number;
    username: string;
    fullName: string;
}

const Home: React.FC = () => {
    /* ---------------- estado usuario simulado ---------------- */
    const [user] = useState<User | null>({
        username: 'JohnDoe',
        fullName: 'John Doe',
        id: 1,
    });

    /* ---------------- estado recetas ---------------- */
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    /* ---------------- fetch al montar ---------------- */
    useEffect(() => {
        const token = localStorage.getItem('jwt');
        fetchRecipes(token ?? undefined)
            .then(setRecipes)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    /* ---------------- handlers UI ---------------- */
    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('jwt');
        navigate('/start');
    };

    const handleOpenRecipe = () => {
        navigate('/newrecipe');
    };

    /* ---------------- render ---------------- */
    if (!user) return <div>Cargando usuario…</div>;
    if (loading) return <div>Cargando recetas…</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            {/* ---------- HEADER ---------- */}
            <header style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem',
                backgroundColor: '#030303',
                color: '#ffffff',
                width: '100vw',
                height: '10vh',
            }}>
                <h1 style={{ fontFamily: 'Libre Caslon Text, serif', fontSize: '2.5rem' }}>
                    D<span style={{ color: '#A6B240' }}>.</span>
                </h1>
                <button onClick={handleLogout} style={{
                    padding: '0.4rem 0.9rem',
                    border: '1px solid #fff',
                    borderRadius: '4px',
                    backgroundColor: 'transparent',
                    color: '#fff',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease'
                }}>Log out</button>
            </header>

            {/* ---------- LISTA DE RECETAS ---------- */}
            <main className="home-content">
                {recipes.length === 0 ? (
                    <p>No hay recetas todavía.</p>
                ) : (
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {recipes.map((r) => (
                            <li key={r.id} style={{ marginBottom: '1rem', borderBottom: '1px solid #eee' }}>
                                <h3>{r.name}</h3>
                                <p>{r.description}</p>
                                <small>{r.difficulty} · {r.category}</small>
                            </li>
                        ))}
                    </ul>
                )}

                {/* ---------- BOTÓN FLOTANTE ---------- */}
                <button onClick={handleOpenRecipe} style={{
                    position: 'fixed',
                    bottom: '40px',
                    right: '25px',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: '#030303',
                    color: '#fff',
                    fontSize: '2.2rem',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
                }}>+</button>
            </main>
        </div>
    );
};

export default Home;
