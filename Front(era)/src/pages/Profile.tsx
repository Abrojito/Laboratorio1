import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    fetchProfile,
    updatePhoto,
    deleteAccount,
    fetchMyRecipes,
} from '../api/userApi';
import { Recipe } from '../api/recipeApi';

interface UserProfile {
    id: number;
    username: string;
    fullName: string;
    photo: string;
}

const Profile: React.FC = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/start'); // o '/login'
            return;
        }
        fetchProfile(token).then(setProfile).catch(e => setError(e.message));
        fetchMyRecipes(token).then(setRecipes).catch(e => setError(e.message));
    }, [navigate]);

    if (error) return <div style={{ color: 'red' }}>{error}</div>;
    if (!profile) return <div>Cargando perfil…</div>;

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/start');
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            updatePhoto(reader.result as string, localStorage.getItem('token')!)
                .then(setProfile)
                .catch(e => setError(e.message));
        };
        reader.readAsDataURL(file);
    };

    const handleDeleteRecipe = async (id: number) => {
        await fetch(`/recipes/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setRecipes(recipes.filter(r => r.id !== id));
    };

    const handleDeleteAccount = () => {
        deleteAccount(localStorage.getItem('token')!)
            .then(() => {
                localStorage.removeItem('token');
                navigate('/start');
            })
            .catch(e => setError(e.message));
    };

    return (
        <div style={{ padding: '1rem' }}>
            <h2>Mi Perfil</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img
                    src={profile.photo || '/default-avatar.png'}
                    alt="avatar"
                    style={{ width: 80, height: 80, borderRadius: '50%' }}
                />
                <div>
                    <p><strong>Usuario:</strong> {profile.username}</p>
                    <p><strong>Nombre:</strong> {profile.fullName}</p>
                </div>
                <button onClick={handleLogout} style={{ marginLeft: 'auto' }}>
                    Logout
                </button>
            </div>

            <div style={{ margin: '1rem 0' }}>
                <label>
                    Cambiar foto:
                    <input type="file" accept="image/*" onChange={handlePhotoChange} />
                </label>
            </div>

            <h3>Mis Recetas</h3>
            {recipes.length === 0 ? (
                <p>No has publicado ninguna receta.</p>
            ) : (
                <ul>
                    {recipes.map(r => (
                        <li key={r.id}>
                            {r.name}{' '}
                            <button onClick={() => handleDeleteRecipe(r.id)}>Eliminar</button>
                        </li>
                    ))}
                </ul>
            )}

            <button
                onClick={handleDeleteAccount}
                style={{ marginTop: '2rem', color: 'white', background: 'red', padding: '0.5rem 1rem' }}
            >
                Eliminar mi cuenta
            </button>
        </div>
    );
};

export default Profile;
