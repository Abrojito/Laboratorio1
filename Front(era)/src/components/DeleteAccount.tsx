// src/components/DeleteAccount.tsx
import React, { useState } from 'react';
import { API_URL } from '../api/config';
import { useModal } from "../context/ModalContext";

const DeleteAccount: React.FC = () => {
    const [confirmText, setConfirmText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { alert } = useModal();

    // Obtener el ID del usuario y token del localStorage
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (confirmText !== 'ELIMINAR') {
            setError('Por favor, ingrese ELIMINAR para confirmar');
            return;
        }

        if (!userId || !token) {
            setError('Debes iniciar sesión primero');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_URL}/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Error al eliminar la cuenta');
            }

            // Eliminar datos de sesión
            localStorage.removeItem('token');
            localStorage.removeItem('userId');

            await alert({ title: "Cuenta", message: "Cuenta eliminada correctamente" });
            // Aquí puedes redirigir al usuario a la página principal
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al eliminar cuenta');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-form delete-form">
            <h2>Eliminar Cuenta</h2>
            <p className="warning-text">Esta acción no se puede deshacer.</p>
            {error && <p className="error-text">{error}</p>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="confirm">Escriba "ELIMINAR" para confirmar</label>
                    <input
                        type="text"
                        id="confirm"
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="btn-danger" disabled={loading}>
                    {loading ? 'Procesando...' : 'Eliminar Cuenta'}
                </button>
            </form>
        </div>
    );
};

export default DeleteAccount;
