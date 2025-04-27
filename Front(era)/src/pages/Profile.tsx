import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchProfile } from '../api/userApi';
import '../styles/Profile.css';

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
            .then(data => {
                console.log("Respuesta cruda del backend:", data);
                setProfile(data);
            })
            .catch(() => navigate('/start'));
    }, [navigate, token]);


    if (!profile) return <div className="loading">Loading…</div>;

    return (
        <div className="profile-container">
            <h2 className="profile-title">Profile</h2>
            <div className="profile-pic-wrapper">
                <img className="profile-pic" src={profile.photo || '/default-avatar.png'} alt="Profile" />
            </div>
            <h3 className="profile-name">{profile.fullName}</h3>
            <p className="profile-username">@{profile.username}</p>

            <div className="profile-options">
                <button onClick={() => navigate('/me/update')}>Edit Profile</button>
                <button>My Recipes</button>
            </div>

            <button className="logout-btn" onClick={() => {
                localStorage.removeItem('token');
                navigate('/start');
            }}>Logout</button>
        </div>
    );
};

export default Profile;
