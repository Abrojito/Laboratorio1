import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import {fetchRecipes, Recipe} from '../api/recipeApi';
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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('jwt');
        fetchRecipes(token ?? undefined)
            .then(setRecipes)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    const handleProfile = () => {
        navigate('/profile');
    };

    const handleOpenRecipe = () => {
        navigate('/newrecipe');
    };

    if (!user) return <div>Cargando usuario…</div>;
    if (loading) return <div>Cargando recetas…</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
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

                {/* Botón circular de perfil */}
                <button
                    onClick={handleProfile}
                    style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        border: '1px solid #fff',
                        backgroundColor: 'transparent',
                        color: '#fff',
                        fontSize: '1.2rem',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                    title="Mi perfil"
                >
                    {/* Puedes reemplazar la letra P por un ícono si importas uno */}
                    P
                </button>
            </header>

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
                <button
                    onClick={handleOpenRecipe}
                    style={{
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
                    }}
                >
                    +
                </button>
            </main>
        </div>
    );
};

export default Home;
