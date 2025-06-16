import React, { useState } from "react";
import { Link } from "react-router-dom";

interface UserProfileDTO {
    id: number;
    username: string;
    fullName: string;
    photo: string;
    followed: boolean;
}

const UserSearch: React.FC = () => {
    const [term, setTerm] = useState("");
    const [results, setResults] = useState<UserProfileDTO[]>([]);
    const token = localStorage.getItem("token") || "";

    const handleSearch = async () => {
        const res = await fetch(`http://localhost:8080/api/users/search?term=${encodeURIComponent(term)}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setResults(data);
    };

    const toggleFollow = async (userId: number, followed: boolean) => {
        const method = followed ? "DELETE" : "POST";
        await fetch(`http://localhost:8080/api/users/${userId}/${followed ? "unfollow" : "follow"}`, {
            method,
            headers: { Authorization: `Bearer ${token}` }
        });

        setResults(prev =>
            prev.map(u => (u.id === userId ? { ...u, followed: !followed } : u))
        );
    };

    return (
        <div style={{ padding: "1.5rem" }}>
            <h2>Buscar usuarios</h2>
            <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
                <input
                    type="text"
                    placeholder="Buscar por username"
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    style={{
                        flex: 1,
                        padding: "0.5rem",
                        borderRadius: "8px",
                        border: "1px solid #ccc"
                    }}
                />
                <button onClick={handleSearch} style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "#4caf50",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer"
                }}>
                    Buscar
                </button>
            </div>

            <ul style={{ listStyle: "none", padding: 0 }}>
                {results.map(user => (
                    <li key={user.id} style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "1rem",
                        backgroundColor: "#f9f9f9",
                        borderRadius: "12px",
                        marginBottom: "1rem",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.1)"
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                            <img src={user.photo} alt={user.username} style={{ width: 50, height: 50, borderRadius: "50%" }} />
                            <div>
                                <Link to={`/users/${user.id}`} style={{ textDecoration: "none", color: "#333" }}>
                                    <strong>{user.fullName}</strong><br />@{user.username}
                                </Link>
                            </div>
                        </div>
                        <button onClick={() => toggleFollow(user.id, user.followed)} style={{
                            padding: "0.5rem 1rem",
                            border: "none",
                            backgroundColor: user.followed ? "#ddd" : "#4caf50",
                            color: user.followed ? "#333" : "white",
                            borderRadius: "8px",
                            cursor: "pointer"
                        }}>
                            {user.followed ? "Dejar de seguir" : "Seguir"}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default UserSearch;
