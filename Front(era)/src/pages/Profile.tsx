import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    fetchProfile,
    updatePhoto,
    deleteAccount,
    fetchMyRecipes,
} from '../api/userApi';
import { Recipe } from '../api/recipeApi';
import '../styles/Profile.css';

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
    const token = localStorage.getItem('token')!;

    /* ---------- CARGA datos ---------- */
    useEffect(() => {
        if (!token) {
            navigate('/start');
            return;
        }
        fetchProfile(token).then(setProfile).catch(e => setError(e.message));
        fetchMyRecipes(token).then(setRecipes).catch(e => setError(e.message));
    }, [navigate, token]);

    if (error) return <div className="profile-error">{error}</div>;
    if (!profile) return <div className="profile-loading">Cargando perfil…</div>;

    /* ---------- Handlers ---------- */
    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/start');
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            updatePhoto(reader.result as string, token)
                .then(setProfile)
                .catch(e => setError(e.message));
        };
        reader.readAsDataURL(file);
    };

    const handleDeleteRecipe = async (id: number) => {
        await fetch(`/api/recipes/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });
        setRecipes(recipes.filter(r => r.id !== id));
    };

    const handleDeleteMyAccount = () => {
        deleteAccount(token)
            .then(() => {
                localStorage.removeItem('token');
                navigate('/start');
            })
            .catch(e => setError(e.message));
    };

    /* ---------- Render ---------- */
    return (
        <div className="profile-page">
            {/* Header */}
            <header className="profile-header">
                <button className="back-btn" onClick={() => navigate(-1)}>←</button>
                <h1 className="profile-username">{profile.username}</h1>
                <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </header>

            {/* Foto y nombre */}
            <section className="profile-info">
                <img
                    className="profile-photo"
                    src={profile.photo || '/default-avatar.png'}
                    alt="Foto de perfil"
                />
                <p className="profile-fullname">{profile.fullName}</p>

                <label className="photo-input">
                    Cambiar foto
                    <input type="file" accept="image/*" onChange={handlePhotoChange} />
                </label>
            </section>

            {/* Lista de recetas */}
            <h2 className="section-title">Mis recetas</h2>
            {recipes.length === 0 ? (
                <p className="no-recipes">Aún no has publicado recetas.</p>
            ) : (
                <div className="recipe-grid">
                    {recipes.map(r => (
                        <div key={r.id} className="recipe-card">
                            <img className="recipe-img" src={r.image} alt={r.name} />
                            <div className="recipe-body">
                                <h3 className="recipe-title">{r.name}</h3>
                                <p className="recipe-desc">{r.description}</p>
                                <div className="recipe-meta">
                                    <span className="recipe-time">⏱ {r.time}</span>
                                    <button
                                        className="recipe-delete"
                                        onClick={() => handleDeleteRecipe(r.id)}
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Eliminar cuenta */}
            <button className="delete-account-btn" onClick={handleDeleteMyAccount}>
                Eliminar mi cuenta
            </button>
        </div>
    );
};

export default Profile;
