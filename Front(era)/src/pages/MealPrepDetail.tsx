import React, { useEffect, useState } from "react";
import {Link, useNavigate, useParams} from "react-router-dom";
import { fetchMealPrep, createMealPrepReview, downloadMealPrepPdf } from "../api/mealPrepApi";
import { MealPrep } from "../types/MealPrep";
import RecipeCard from "../components/RecipeCard";
import Rating from "@mui/material/Rating";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import ShoppingListSelector from "../components/ShoppingListSelector";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import IconButton from "@mui/material/IconButton";
import ShareIcon from "@mui/icons-material/Share";
import { toggleMealPrepFavorite, isMealPrepFavorite, removeMealPrepFavorite } from "../api/favoriteApi";
import CollectionsBookmarkIcon from "@mui/icons-material/CollectionsBookmark";
import CollectionSelector from "../components/CollectionSelector";
import ShareModal from "../components/ShareModal";
import { useModal } from "../context/ModalContext";


const MealPrepDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [mealPrep, setMealPrep] = useState<MealPrep | null>(null);
    const [comment, setComment] = useState("");
    const [rating, setRating] = useState<number | null>(0);
    const [isFav, setIsFav] = useState(false);
    const [showCollectionMenu, setShowCollectionMenu] = useState(false);
    const [shareOpen, setShareOpen] = useState(false);
    const navigate = useNavigate();
    const { confirm, alert } = useModal();


    const token = localStorage.getItem("token");
    const username = getUsernameFromToken(token);

    useEffect(() => {
        if (id) {
            fetchMealPrep(Number(id)).then(setMealPrep);
            checkFavorite();
        }
    }, [id]);

    const checkFavorite = async () => {
        if (!token || !id) return;
        try {
            const fav = await isMealPrepFavorite(Number(id));
            setIsFav(fav);
        } catch (err) {
            console.error("Error verificando favorito", err);
        }
    };

    const handleToggleFavorite = async () => {
        if (!token || !id) return;
        try {
            if (isFav) {
                const ok = await confirm({
                    title: "Quitar de favoritos",
                    message: "¿Querés quitar este meal prep de favoritos?",
                    confirmText: "Quitar",
                    cancelText: "Cancelar",
                });
                if (!ok) return;
                await removeMealPrepFavorite(Number(id));
                setIsFav(false);
                return;
            }

            await toggleMealPrepFavorite(Number(id));
            setIsFav(true);
        } catch (err) {
            console.error("Error al cambiar favorito", err);
        }
    };

    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!token || !username) {
            await alert({ title: "Reseñas", message: "Tenés que estar logueado para comentar." });
            return;
        }

        if (!id || rating === null || comment.trim() === "") return;

        const payload = { comment, rating, username };

        try {
            await createMealPrepReview(Number(id), payload, token);
            const updatedMealPrep = await fetchMealPrep(Number(id));
            setMealPrep(updatedMealPrep);
            setComment("");
            setRating(0);
        } catch (err) {
            console.error("Error al enviar review", err);
        }
    };

    const downloadBlobFile = (blob: Blob, fileName: string) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    };

    const handleExportPdf = async () => {
        if (!id) return;
        try {
            const blob = await downloadMealPrepPdf(Number(id));
            downloadBlobFile(blob, `mealprep-${id}.pdf`);
        } catch {
            await alert({ title: "PDF", message: "No se pudo exportar el PDF del meal prep." });
        }
    };

    const handleCopyLink = async () => {
        const url = window.location.href;
        try {
            await navigator.clipboard.writeText(url);
            await alert({ title: "Compartir", message: "Link copiado al portapapeles" });
        } catch {
            await alert({ title: "Compartir", message: "No se pudo copiar el link." });
        }
    };

    if (!mealPrep) return <p>Cargando meal prep...</p>;

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
        <div style={{ padding: "1rem", maxWidth: "800px", margin: "auto", marginTop: "2.5rem"}}>
            <img src={mealPrep.image} alt={mealPrep.name} style={{ width: "100%", borderRadius: "12px" }} />
            <h1>{mealPrep.name}</h1>

            <div style={{ display:"flex", alignItems:"center", gap:"6px", margin:"8px 0" }}>
                <span style={{ fontSize:"0.9rem", color:"#666" }}>
                    ⭐ {(mealPrep.averageRating ?? 0).toFixed(1)} ({mealPrep.ratingCount ?? 0})
                </span>
            </div>


            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", position: "relative", zIndex: 30 }}>
                <IconButton onClick={handleToggleFavorite} style={{ color: isFav ? 'red' : 'gray' }}>
                    {isFav ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                </IconButton>

                <div style={{ position: "relative" }}>
                    <IconButton onClick={() => setShowCollectionMenu(prev => !prev)}>
                        <CollectionsBookmarkIcon color="primary" />
                    </IconButton>
                    {showCollectionMenu && (
                        <div style={{ position: "absolute", top: "120%", left: 0 }}>
                            <CollectionSelector mealPrepId={mealPrep.id} />
                        </div>
                    )}
                </div>
                <Button variant="outlined" size="small" onClick={handleExportPdf}>
                    Exportar PDF
                </Button>
                <IconButton onClick={() => setShareOpen(true)} title="Compartir">
                    <ShareIcon />
                </IconButton>
            </div>

            <ShareModal
                open={shareOpen}
                onClose={() => setShareOpen(false)}
                title={mealPrep.name}
                text={`Mirá esto en Dishly: ${mealPrep.name}`}
                url={window.location.href}
                onCopyLink={handleCopyLink}
            />


            <p style={{ marginBottom: "2rem"}} >{mealPrep.description}</p>

            <ShoppingListSelector mealPrepId={mealPrep.id} />

            <p style={{ marginTop: "8px" }}>
                <strong>
                    <Link to={`/users/${mealPrep.userId}`} style={{ textDecoration: "none", color: "#1976d2" }}>
                        {mealPrep.creatorUsername}
                    </Link>
                </strong>
            </p>


            <h2>Recetas</h2>
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "1.5rem"
            }}>
                {mealPrep.recipes.map(recipe => (
                    <RecipeCard
                        key={recipe.id}
                        recipe={{
                            id: recipe.id,
                            name: recipe.name,
                            image: recipe.image,
                            description: "",
                            difficulty: "",
                            category: "",
                            author: "",
                            userId: 0,
                            creatorUsername: "",
                            steps: [],
                            ingredients: [],
                            publicRecipe: false,
                            averageRating: 0,
                            ratingCount: 0,
                        }}
                    />
                ))}
            </div>

            <div style={{ marginTop: "32px" }}>
                <h2>Reseñas</h2>
                {mealPrep.reviews.map(review => (
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

function getUsernameFromToken(token: string | null): string | null {
    if (!token) return null;
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.username || null;
    } catch {
        return null;
    }
}

export default MealPrepDetail;
