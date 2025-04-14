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
        navigate('/login');
    };

    if (!user) return <div>Cargando...</div>;

    return (
        <div className="home-container">
            <header className="home-header">
                <h1>Dishly</h1>
                <div className="user-info">
                    <span>Bienvenido, {user.fullName}</span>
                    <button onClick={handleLogout}>Cerrar sesión</button>
                </div>
            </header>

            <main className="home-content">
                <h2>Panel principal</h2>
                <div className="dashboard">
                    {/* Aquí puedes añadir tarjetas, widgets o secciones */}
                    <div className="card">
                        <h3>Mis platos favoritos</h3>
                        <p>Contenido próximamente...</p>
                    </div>
                    <div className="card">
                        <h3>Recomendaciones</h3>
                        <p>Contenido próximamente...</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Home;