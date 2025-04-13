// src/pages/auth/UpdateProfile.tsx
import React, { useState, useEffect } from 'react';
import { API_URL } from '../../api/config';

interface User {
    name: string;
    email: string;
}

const UpdateProfile: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Obtener el ID del usuario del localStorage
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    useEffect(() => {
        // Cargar los datos del usuario al montar el componente
        const fetchUserData = async () => {
            if (!userId || !token) {
                setError('Debes iniciar sesión primero');
                return;
            }

            try {
                const response = await fetch(`${API_URL}/${userId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('No se pudo cargar la información del usuario');
                }

                const userData = await response.json();
                setUser(userData);
                setNewName(userData.name);
                setNewEmail(userData.email);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error al cargar datos');
            }
        };

        fetchUserData();
    }, [userId, token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId || !token) {
            setError('Debes iniciar sesión primero');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_URL}/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name: newName, email: newEmail }),
            });

            if (!response.ok) {
                throw new Error('Error al actualizar el perfil');
            }

            const updatedUser = await response.json();
            setUser(updatedUser);
            alert('Perfil actualizado correctamente');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al actualizar perfil');
        } finally {
            setLoading(false);
        }
    };

    if (!user && !error) {
        return <div>Cargando...</div>;
    }

    return (
        <div className="auth-form">
            <h2>Actualizar Perfil</h2>
            {error && <p className="error-text">{error}</p>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="name">Nombre</label>
                    <input
                        type="text"
                        id="name"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Actualizando...' : 'Actualizar Perfil'}
                </button>
            </form>
        </div>
    );
};

export default UpdateProfile;