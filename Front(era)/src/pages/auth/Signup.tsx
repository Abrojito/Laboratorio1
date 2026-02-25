import React, { useState } from 'react';
import {useNavigate} from "react-router-dom";

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const Signup: React.FC = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        setLoading(true);
        setError('');

        try {
            console.log("Payload sent:", {
                username,
                email,
                password
            });
            const response = await fetch(`${BASE}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ username, email, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.log(errorData)
                throw new Error(errorData.message || 'Error');
            }

            const data = await response.json();
            console.log('Register successful:', data);

           navigate("/login")

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error');
        } finally {
            setLoading(false);
        }
    };

    // Ejemplo usando fetch
    async function registerUser(userData) {
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (!response.ok) {
                // Mostrar el mensaje de error al usuario
                displayError(data.message); // Por ejemplo: "El nombre de usuario ya está en uso"
                return false;
            }

            // Registro exitoso
            return true;
        } catch (error) {
            displayError("Hubo un error de conexión");
            return false;
        }
    }

    function displayError(message) {
        // Mostrar el mensaje en tu interfaz de usuario
        const errorElement = document.getElementById('error-message');
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }

    return (
        <div className="auth-form">
            <h1>¡Bienvenido!</h1>
            {error && <p className="error-text">{error}</p>}
            <p>Registrate en Dishly</p>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="name">Nombre de usuario</label>
                    <input
                        type="text"
                        id="name"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="email">Correo electrónico</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Contraseña</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="confirm-password">Confirmar contraseña</label>
                    <input
                        type="password"
                        id="confirm-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Procesando...' : 'Registrarme'}
                </button>
                <button className="button-signup" onClick={() => navigate('/login')}>Iniciar sesión</button>
            </form>
        </div>
    );
};

export default Signup;
