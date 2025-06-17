import React, { useEffect, useState } from "react";
import {Link, useParams } from "react-router-dom";
import Rating from "@mui/material/Rating";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { Review } from "../types/Recipe.ts";
import ShoppingListSelector from "../components/ShoppingListSelector.tsx";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import IconButton from "@mui/material/IconButton";
import { toggleFavorite, isFavorite } from "../api/favoriteApi";
import CollectionsBookmarkIcon from "@mui/icons-material/CollectionsBookmark";
import CollectionSelector from "../components/CollectionSelector";
import { useNavigate } from "react-router-dom";




interface IngredientWithQuantity {
    ingredientId: number;
    quantity: string;
}

interface Recipe {
    id: number;
    name: string;
    description: string;
    image: string;
    author: string;
    authorPhoto: string;
    category: string;
    userId: number;
    time: string;
    ingredients: IngredientWithQuantity[];
    steps: string[];
    reviews: Review[];
}


function getUsernameFromToken(token: string | null): string | null {
    if (!token) return null;
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.username || null;
    } catch {
        return null;
    }
}

const RecipeDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const token = localStorage.getItem("token");
    const username = getUsernameFromToken(token);

    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [ingredientNames, setIngredientNames] = useState<Record<number, string>>({});
    const [comment, setComment] = useState("");
    const [rating, setRating] = useState<number | null>(0);
    const [error, setError] = useState<string | null>(null);
    const [isFav, setIsFav] = useState(false);
    const [showCollectionMenu, setShowCollectionMenu] = useState(false);
    const navigate = useNavigate();



    useEffect(() => {
        fetchRecipe();
        checkFavorite();
    }, [id]);

    const checkFavorite = async () => {
        if (!token || !id) return;
        const fav = await isFavorite(Number(id));
        setIsFav(fav);
    };


    const fetchRecipe = async () => {
        if (!id) return;
        try {
            const res = await fetch(`http://localhost:8080/api/recipes/${id}`);
            const data = await res.json();
            setRecipe(data);

            const ingRes = await fetch("http://localhost:8080/ingredients");
            const allIngredients = await ingRes.json();
            const nameMap: Record<number, string> = {};
            allIngredients.forEach((ing: any) => {
                nameMap[ing.id] = ing.name;
            });
            setIngredientNames(nameMap);
        } catch {
            setError("Error al cargar los datos");
        }
    };

    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!token || !username) {
            alert("Tenés que estar logueado para comentar.");
            return;
        }

        if (!id || rating === null || comment.trim() === "") return;

        const payload = { comment, rating, username };
        console.log("ENVIANDO:", payload);

        const response = await fetch(`http://localhost:8080/api/recipes/${id}/reviews`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            console.error("Error al guardar reseña", await response.text());
            return;
        }

        // 🔁 Esperá un poco y recargá la receta
        await new Promise(res => setTimeout(res, 250)); // delay corto
        await fetchRecipe();

        setComment("");
        setRating(0);
    };

    const handleToggleFavorite = async () => {
        if (!token || !id) return;
        await toggleFavorite(Number(id));
        setIsFav(prev => !prev);
    };



    if (error) return <p>{error}</p>;
    if (!recipe) return <p>Cargando receta...</p>;

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
    <div style={{ padding: "16px", maxWidth: "800px", margin: "auto" }}>
            <img src={recipe.image} alt="Imagen del plato" style={{ width: "100%", borderRadius: "12px" }} />
            <h1>{recipe.name}</h1>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                <IconButton onClick={handleToggleFavorite} style={{ color: isFav ? 'red' : 'gray' }}>
                    {isFav ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                </IconButton>

                <div style={{ position: "relative" }}>
                    <IconButton onClick={() => setShowCollectionMenu(prev => !prev)}>
                        <CollectionsBookmarkIcon color="primary" />
                    </IconButton>
                    {showCollectionMenu && (
                        <div style={{ position: "absolute", top: "120%", left: 0 }}>
                            <CollectionSelector recipeId={recipe.id} />
                        </div>
                    )}
                </div>
            </div>



            <ShoppingListSelector recipeIds={[recipe.id]} />

            <h2>Ingredientes</h2>
            <ul style={{ listStyle: "none", padding: 0 }}>
                {recipe.ingredients.map((ing, idx) => (
                    <li key={idx}>
                        <strong>{ing.quantity}</strong> {ingredientNames[ing.ingredientId] || "??"}
                    </li>
                ))}
            </ul>

            <h2>Pasos</h2>
            <ol style={{ paddingLeft: "1.2rem" }}>
                {recipe.steps.map((step, idx) => (
                    <li key={idx} style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
                        <div style={{
                            width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "#ccc",
                            display: "flex", justifyContent: "center", alignItems: "center", fontWeight: "bold", marginRight: "8px"
                        }}>{idx + 1}</div>
                        <p>{step}</p>
                    </li>
                ))}
            </ol>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "32px 0 24px 0" }}>
                <img src={recipe.authorPhoto || "/default-avatar.png"} alt="Foto de perfil"
                     style={{ width: "48px", height: "48px", borderRadius: "50%" }} />
                <div>
                    <p>
                        <strong>
                            <Link to={`/users/${recipe.userId}`} style={{ textDecoration: "none", color: "#1976d2" }}>
                                {recipe.author}
                            </Link>
                        </strong>
                    </p>
                    <p>{new Date(recipe.time).toLocaleDateString()}</p>
                </div>
            </div>

            <div style={{ marginTop: "32px" }}>
                <h2>Reseñas</h2>
                {recipe.reviews?.map((review) => (
                    <div key={review.id} style={{
                        padding: "16px",
                        borderRadius: "12px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        marginBottom: "24px",
                        backgroundColor: "white"
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                            <img src={review.userPhoto || "/default-avatar.png"} alt="Foto"
                                 style={{ width: 40, height: 40, borderRadius: "50%" }} />
                            <div>
                                <Link
                                    to={`/users/${review.userId}`}
                                    style={{ textDecoration: "none", color: "#333" }}
                                    onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
                                    onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}
                                >
                                    <strong>{review.username}</strong>
                                </Link>
                                <p style={{ fontSize: "0.8rem", margin: 0, color: "#888" }}>
                                    {new Date(review.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        <Rating value={review.rating} readOnly size="small" />
                        <blockquote style={{ fontStyle: "italic", marginTop: "8px", marginBottom: "4px", color: "#333" }}>
                            “{review.comment}”
                        </blockquote>
                    </div>
                ))}

                <form onSubmit={handleReviewSubmit} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <h3>Dejá tu reseña</h3>
                    <Rating value={rating} onChange={(_, val) => setRating(val)} />
                    <TextField
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        label="Añade un comentario"
                        fullWidth
                        multiline
                    />
                    <Button type="submit" variant="contained">Enviar</Button>
                </form>
            </div>
        </div>
      </>
    );
};

export default RecipeDetail;
