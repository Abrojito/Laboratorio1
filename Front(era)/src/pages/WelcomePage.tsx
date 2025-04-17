import React, {} from 'react';
import {useNavigate} from 'react-router-dom';
import '../styles/WelcomePage.css';

const WelcomePage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <>
            <main className="welcome-content">
                <img src="/dishly.jpg" alt="Logo"/>
                <h1>dishly</h1>
                <p>Tu aplicación de recetas y platos favoritos.</p>
                <div className="button-group">
                    <button onClick={() => navigate('/login')}>Login</button>
                    <button onClick={() => navigate('/signup')}>Signup</button>
                </div>
            </main>
        </>
    );
}

export default WelcomePage;