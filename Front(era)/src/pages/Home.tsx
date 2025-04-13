import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '.././App.css'; // Asegúrate de crear este archivo CSS

interface User {
    id: number;
    username: string;
    fullName: string;
}

const Home: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
       fetch("http://localhost:8080/users")

        if (!userData) {
            navigate('/login');
            return;
        }

        setUser(JSON.parse(userData));
    }, [navigate]);

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