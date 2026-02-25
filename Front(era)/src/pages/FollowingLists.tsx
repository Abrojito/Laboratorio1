import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCursorPagination } from "../hooks/useCursorPagination";

interface UserProfileDTO {
    id: number;
    username: string;
    fullName: string;
    photo: string;
    followed: boolean;
}

const FollowingLists: React.FC = () => {
    const [activeTab, setActiveTab] = useState<"followers" | "following">("followers");
    const token = localStorage.getItem("token") || "";
    const [userId, setUserId] = useState<number | null>(null);

    const {
        items: followers,
        loadMore: loadMoreFollowers,
        isLoading: followersLoading,
        hasNext: hasMoreFollowers,
        error: followersError,
        reset: resetFollowers,
    } = useCursorPagination<UserProfileDTO>(async (cursor) => {
        if (!userId) return { items: [], nextCursor: null, hasNext: false };
        const params = new URLSearchParams({ limit: "10" });
        if (cursor !== null) params.set("cursor", cursor);
        const res = await fetch(`http://localhost:8080/api/users/${userId}/followers/cursor?${params.toString()}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Error cargando seguidores");
        return res.json();
    });

    const {
        items: following,
        loadMore: loadMoreFollowing,
        isLoading: followingLoading,
        hasNext: hasMoreFollowing,
        error: followingError,
        reset: resetFollowing,
    } = useCursorPagination<UserProfileDTO>(async (cursor) => {
        if (!userId) return { items: [], nextCursor: null, hasNext: false };
        const params = new URLSearchParams({ limit: "10" });
        if (cursor !== null) params.set("cursor", cursor);
        const res = await fetch(`http://localhost:8080/api/users/${userId}/following/cursor?${params.toString()}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Error cargando seguidos");
        return res.json();
    });

    useEffect(() => {
        fetch(`http://localhost:8080/api/users/me`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(user => {
                setUserId(user.id);
            });
    }, []);

    useEffect(() => {
        if (!userId) return;
        resetFollowers();
        resetFollowing();
    }, [userId, resetFollowers, resetFollowing]);

    const toggleFollow = async (targetId: number, followed: boolean) => {
        const method = followed ? "DELETE" : "POST";
        await fetch(`http://localhost:8080/api/users/${targetId}/${followed ? "unfollow" : "follow"}`, {
            method,
            headers: { Authorization: `Bearer ${token}` }
        });

        resetFollowers();
        resetFollowing();
    };

    const renderList = (
        users: UserProfileDTO[],
        error: string | null,
        loading: boolean,
        hasMore: boolean,
        loadMore: () => void
    ) => (
        <>
            {error && <p>{error}</p>}
            <ul style={{ listStyle: "none", padding: 0 }}>
                {users.map(user => (
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
            {hasMore && (
                <button
                    onClick={loadMore}
                    disabled={loading}
                    style={{
                        padding: "0.5rem 1rem",
                        border: "none",
                        backgroundColor: "#A6B240",
                        color: "white",
                        borderRadius: "8px",
                        cursor: "pointer"
                    }}
                >
                    {loading ? "Cargando..." : "Cargar más"}
                </button>
            )}
        </>
    );

    return (
        <div style={{ padding: "1.5rem" }}>
            <h2 style={{ marginBottom: "1rem" }}>Red de usuarios</h2>
            <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
                <button onClick={() => setActiveTab("followers")} style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: activeTab === "followers" ? "#4caf50" : "#eee",
                    color: activeTab === "followers" ? "white" : "#333",
                    cursor: "pointer"
                }}>
                    Seguidores
                </button>
                <button onClick={() => setActiveTab("following")} style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: activeTab === "following" ? "#4caf50" : "#eee",
                    color: activeTab === "following" ? "white" : "#333",
                    cursor: "pointer"
                }}>
                    Siguiendo
                </button>
            </div>

            {activeTab === "followers"
                ? renderList(followers, followersError, followersLoading, hasMoreFollowers, loadMoreFollowers)
                : renderList(following, followingError, followingLoading, hasMoreFollowing, loadMoreFollowing)}
        </div>
    );
};

export default FollowingLists;
