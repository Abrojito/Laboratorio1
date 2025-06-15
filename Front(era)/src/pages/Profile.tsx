import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchProfile, deleteAccount } from '../api/userApi';
import '../styles/Profile.css';
import FloatingMenu from "../components/FloatingMenu.tsx";
import BottomNav from "../components/BottomNav.tsx";

interface UserProfile {
    username: string;
    fullName: string;
    photo: string;
}

const Profile: React.FC = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) {
            navigate('/start');
            return;
        }
        fetchProfile(token)
            .then(data => setProfile(data))
            .catch(() => navigate('/start'));
    }, [navigate, token]);

    if (!profile) return <div className="loading">Loading…</div>;

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

            <h2 className="profile-title">Profile</h2>
            <div className="profile-pic-wrapper">
                <img className="profile-pic" src={profile.photo || '/default-avatar.png'} alt="Profile" />
            </div>
            <h3 className="profile-name">@{profile.username}</h3>

            <div className="profile-options">
                <button onClick={() => navigate('/me/update')}>Edit Profile</button>
                <button onClick={() => navigate('/me/myrecipes')}>My Recipes</button>
                <button onClick={() => navigate('/me/my-mealpreps')}>My MealPreps</button>
                <button onClick={() => navigate('/favorites')}>Favorites</button>
                <button onClick={() => navigate('/collections')}>Collections</button>
            </div>

            <button
                className="logout-btn"
                onClick={() => {
                    localStorage.removeItem('token');
                    navigate('/start');
                }}
            >
                Logout
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
                        alert("Error al eliminar cuenta. Intentalo más tarde.");
                        console.error(error);
                    }
                }}
            >
                Delete Account
            </button>

            <FloatingMenu />
            <BottomNav />
        </div>
    );
};

export default Profile;
