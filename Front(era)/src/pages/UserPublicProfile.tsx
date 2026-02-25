import React, { useEffect, useRef, useState } from "react";
import {useParams, Link, useNavigate} from "react-router-dom";
import RecipeCard from "../components/RecipeCard";
import MealPrepCard from "../components/MealPrepCard";
import { useCursorPagination } from "../hooks/useCursorPagination";

interface Recipe {
    id: number;
    name: string;
    image: string;
    description: string;
    category: string;
    difficulty: string;
    author: string;
    userId: number;
    creatorUsername: string;
    steps: string[];
    ingredients: any[];
}

interface MealPrep {
    id: number;
    name: string;
    image: string;
    description: string;
    author: string;
    authorPhoto: string;
    userId: number;
    publicMealPrep: boolean;
    recipes: Recipe[];
    reviews: any[];
}

interface UserPublicDTO {
    id: number;
    username: string;
    fullName: string;
    photo: string;
    followersCount: number;
    followingCount: number;
    followedByMe: boolean;
}

const UserPublicProfile: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [user, setUser] = useState<UserPublicDTO | null>(null);
    const token = localStorage.getItem("token") || "";
    const navigate = useNavigate();
    const hasInitializedCursorLists = useRef(false);

    const {
        items: publicRecipes,
        loadMore: loadMoreRecipes,
        isLoading: recipesLoading,
        hasNext: hasMoreRecipes,
        error: recipesError,
        reset: resetRecipes,
    } = useCursorPagination<Recipe>(async (cursor) => {
        if (!id) return { items: [], nextCursor: null, hasNext: false };
        const params = new URLSearchParams({ limit: "6" });
        if (cursor !== null) params.set("cursor", cursor);
        const res = await fetch(`http://localhost:8080/api/users/${id}/public/recipes/cursor?${params.toString()}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Error cargando recetas públicas");
        return res.json();
    });

    const {
        items: publicMealPreps,
        loadMore: loadMoreMealPreps,
        isLoading: mealPrepsLoading,
        hasNext: hasMoreMealPreps,
        error: mealPrepsError,
        reset: resetMealPreps,
    } = useCursorPagination<MealPrep>(async (cursor) => {
        if (!id) return { items: [], nextCursor: null, hasNext: false };
        const params = new URLSearchParams({ limit: "6" });
        if (cursor !== null) params.set("cursor", cursor);
        const res = await fetch(`http://localhost:8080/api/users/${id}/public/mealpreps/cursor?${params.toString()}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Error cargando Meal Preps públicos");
        return res.json();
    });

    const fetchUserProfile = async () => {
        const res = await fetch(`http://localhost:8080/api/users/${id}/public`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setUser(data);
    };

    useEffect(() => {
        if (token && id) fetchUserProfile();
    }, [id, token]);

    useEffect(() => {
        if (!id) return;
        if (!hasInitializedCursorLists.current) {
            hasInitializedCursorLists.current = true;
            return;
        }
        resetRecipes();
        resetMealPreps();
    }, [id, resetRecipes, resetMealPreps]);

    const toggleFollow = async () => {
        if (!user) return;

        const method = user.followedByMe ? "DELETE" : "POST";

        await fetch(`http://localhost:8080/api/users/${id}/${user.followedByMe ? "unfollow" : "follow"}`, {
            method,
            headers: { Authorization: `Bearer ${token}` }
        });

        // ✅ Actualización local rápida (inmediata)
        setUser({
            ...user,
            followedByMe: !user.followedByMe,
            followersCount: user.followedByMe ? user.followersCount - 1 : user.followersCount + 1,
        });

        // ⏳ Refetch final por si algo cambió desde el backend
        setTimeout(fetchUserProfile, 400); // pequeño delay opcional para evitar parpadeo
    };


    if (!user) return <p>Cargando...</p>;

    return (
        <>
            <button
                onClick={() => navigate(-1)}
                style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '2rem',
                    cursor: 'pointer',
                    color: 'black',
                    position: 'absolute',
                    top: '20px',
                    left: '20px',
                    zIndex: 999,
                }}
            >
                ←
            </button>
        <div style={{ padding: "1.5rem" }}>
            <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
                <img src={user.photo} alt="foto" style={{ width: 100, height: 100, borderRadius: "50%" }} />
                <div>
                    <h2>{user.fullName}</h2>
                    <p style={{ color: "#777" }}>@{user.username}</p>
                    <button onClick={toggleFollow} style={{
                        padding: "0.5rem 1rem",
                        backgroundColor: user.followedByMe ? "#ddd" : "#4caf50",
                        color: user.followedByMe ? "#333" : "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer"
                    }}>
                        {user.followedByMe ? "Dejar de seguir" : "Seguir"}
                    </button>
                    <p style={{ marginTop: "0.5rem" }}>
                        <Link to={`/users/${user.id}/followers`} style={{ textDecoration: "none", color: "#4caf50" }}>
                            {user.followersCount} seguidores
                        </Link> •{" "}
                        <Link to={`/users/${user.id}/following`} style={{ textDecoration: "none", color: "#4caf50" }}>
                            {user.followingCount} seguidos
                        </Link>
                    </p>
                </div>
            </div>

            <section style={{ marginTop: "2rem" }}>
                <h3>Recetas públicas</h3>
                {recipesError && <p>{recipesError}</p>}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                    gap: "1.5rem",
                    paddingTop: "1rem"
                }}>
                    {publicRecipes.map(recipe => (
                        <RecipeCard key={recipe.id} recipe={recipe} />
                    ))}
                </div>
                {hasMoreRecipes && (
                    <button
                        onClick={loadMoreRecipes}
                        disabled={recipesLoading}
                        style={{
                            marginTop: "1rem",
                            padding: "0.6rem 1rem",
                            border: "none",
                            borderRadius: "8px",
                            backgroundColor: "#A6B240",
                            color: "white",
                            cursor: "pointer"
                        }}
                    >
                        {recipesLoading ? "Cargando..." : "Cargar más"}
                    </button>
                )}
            </section>

            <section style={{ marginTop: "2rem" }}>
                <h3>Meal Preps públicos</h3>
                {mealPrepsError && <p>{mealPrepsError}</p>}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                    gap: "1.5rem",
                    paddingTop: "1rem"
                }}>
                    {publicMealPreps.map(mp => (
                        <MealPrepCard key={mp.id} mealPrep={mp} />
                    ))}
                </div>
                {hasMoreMealPreps && (
                    <button
                        onClick={loadMoreMealPreps}
                        disabled={mealPrepsLoading}
                        style={{
                            marginTop: "1rem",
                            padding: "0.6rem 1rem",
                            border: "none",
                            borderRadius: "8px",
                            backgroundColor: "#A6B240",
                            color: "white",
                            cursor: "pointer"
                        }}
                    >
                        {mealPrepsLoading ? "Cargando..." : "Cargar más"}
                    </button>
                )}
            </section>
        </div>
      </>
    );
};

export default UserPublicProfile;
