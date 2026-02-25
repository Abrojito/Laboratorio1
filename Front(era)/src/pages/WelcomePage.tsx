import React, {} from 'react';
import {useNavigate} from 'react-router-dom';
import '../styles/WelcomePage.css';

const WelcomePage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <section className="welcome-screen">
            <main className="welcome-content">
                <h1 className="brand">
                    Dishly<span className="dot">.</span>
                </h1>
                <div className="button-group">
                    <button className="login" onClick={() => navigate('/login')}>Iniciar sesión</button>
                    <button className="signup" onClick={() => navigate('/signup')}>Registrarme</button>
                </div>
            </main>
        </section>
    );
}

export default WelcomePage;
