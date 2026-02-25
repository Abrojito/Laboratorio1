import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchProfile, deleteAccount } from '../api/userApi';
import '../styles/Profile.css';
import FloatingMenu from "../components/FloatingMenu.tsx";
import BottomNav from "../components/BottomNav.tsx";
import { useModal } from "../context/ModalContext";

interface UserProfile {
    username: string;
    fullName: string;
    photo: string;
    followersCount: number;
    followingCount: number;
}

const Profile: React.FC = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const { alert } = useModal();

    useEffect(() => {
        if (!token) {
            navigate('/start');
            return;
        }
        fetchProfile(token)
            .then(data => setProfile(data))
            .catch(() => navigate('/start'));
    }, [navigate, token]);

    if (!profile) return <div className="loading">Cargando…</div>;


    return (
        <div className="profile-container">
            <button
                onClick={() => navigate('/home')}
                style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '2rem',
                    cursor: 'pointer',
                    color: '#A6B240',
                    position: 'absolute',
                    top: '20px',
                    left: '20px',
                }}
            >
                ←
            </button>

            <h2 className="profile-title">Perfil</h2>
            <div className="profile-pic-wrapper">
                <img className="profile-pic" src={profile.photo || '/default-avatar.png'} alt="Perfil" />
            </div>
            <h3 className="profile-name">@{profile.username}</h3>
            <p
                onClick={() => navigate('/me/following')}
                style={{
                    color: '#555',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    marginTop: '-0.25rem'
                }}
            >
                {profile.followersCount} seguidores • {profile.followingCount} seguidos
            </p>

            <div className="profile-options">
                <button onClick={() => navigate('/me/update')}>Editar perfil</button>
                <button onClick={() => navigate('/me/myrecipes')}>Mis recetas</button>
                <button onClick={() => navigate('/me/my-mealpreps')}>Mis Meal Preps</button>
                <button onClick={() => navigate('/favorites')}>Favoritos</button>
                <button onClick={() => navigate('/collections')}>Colecciones</button>
                <button onClick={() => navigate('/me/undesired-ingredients')}>Ingredientes no deseados</button>
            </div>

            <button
                className="logout-btn"
                onClick={() => {
                    localStorage.removeItem('token');
                    navigate('/start');
                }}
            >
                Cerrar sesión
            </button>

            <button
                style={{
                    backgroundColor: "#e53935",
                    color: "white",
                    border: "none",
                    padding: "10px 16px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    marginTop: "12px"
                }}
                onClick={async () => {
                    if (!token) return;
                    const confirmDelete = window.confirm("¿Estás seguro de que querés eliminar tu cuenta? Esta acción no se puede deshacer.");
                    if (!confirmDelete) return;

                    try {
                        await deleteAccount(token);
                        localStorage.removeItem("token");
                        navigate("/start");
                    } catch (error) {
                        await alert({ title: "Cuenta", message: "Error al eliminar cuenta. Intentalo más tarde." });
                        console.error(error);
                    }
                }}
            >
                Eliminar cuenta
            </button>

            <FloatingMenu />
            <BottomNav />
        </div>
    );
};

export default Profile;
