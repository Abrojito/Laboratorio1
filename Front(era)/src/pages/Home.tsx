import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '.././App.css';

interface User {
    id: number;
    username: string;
    fullName: string;
}

const Home: React.FC = () => {
    const [user] = useState<User | null>({username: 'JohnDoe', fullName: 'John Doe', id: 1}); // Simulando un usuario autenticado
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/start');
    };

    const handleOpenRecipe = () => {
        navigate('/newrecipe');
    };

    if (!user) return <div>Cargando...</div>;

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

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                        onClick={handleLogout}
                        style={{
                            padding: '0.4rem 0.9rem',
                            border: '1px solid #fff',
                            borderRadius: '4px',
                            backgroundColor: 'transparent',
                            color: '#fff',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s ease'
                        }}>
                        Log out
                    </button>
                </div>
            </header>

            <main className="home-content">
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
                    }}>
                    +
                </button>
            </main>
        </div>
    );
};

export default Home;