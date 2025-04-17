import  '../styles/Splash.css';
import React, { } from 'react';
import {useNavigate} from "react-router-dom";

const Splash: React.FC = () => {
    const navigate = useNavigate();

    return (
        <section className="screen">
            {/* Contenido centrado */}
            <div className="content">
                <h1 className="brand">
                    Dishly<span className="dot">.</span>
                </h1>
                <p className="subtitle">
                    All your favourite recipes just &nbsp;a tap away.
                </p>
                <button  className="cta" onClick={() => navigate('/start')}>Get Started</button>
            </div>
        </section>
    );
};

export default Splash;
