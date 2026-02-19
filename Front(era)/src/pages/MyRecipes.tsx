import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { fetchMyRecipesPage } from "../api/recipeApi";
import RecipeCard from "../components/RecipeCard";
import { Recipe } from "../types/Recipe";


function toFullRecipe(r: any): Recipe {
  return {
    id:          r.id,
    name:        r.name,
    description: r.description,
    image:       r.image,
    publicRecipe:r.publicRecipe,

    category:    r.category     ?? "",
    author:      r.author       ?? "",
    userId:      r.userId       ?? 0,
    difficulty:  r.difficulty   ?? "",
    steps:       r.steps        ?? [],
    ingredients: r.ingredients  ?? [],
    averageRating: r.averageRating ?? 0,
    ratingCount:   r.ratingCount   ?? 0,
  };
}

const MyRecipes: React.FC = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token") || "";

  /* paginación */
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* redirect si no hay token */
  useEffect(() => {
    if (!token) navigate("/start");
  }, [token, navigate]);

  /* carga cada vez que cambia page */
  useEffect(() => {
    if (!token) return;

    fetchMyRecipesPage(page, 6, token)
        .then(p => {
          const normalized = p.content.map(toFullRecipe);
          setRecipes(prev =>
              page === 0 ? normalized : [...prev, ...normalized]
          );
          setHasMore(page + 1 < p.totalPages);
        })
        .catch(() => setError("Error cargando tus recetas."))
        .finally(() => setLoading(false));
  }, [page, token]);

  /* handlers delete / edit / view ---------------------------- */
  const handleViewRecipe = (id: number) => navigate(`/recipes/${id}`);

  const handleEditRecipe = (id: number) => navigate(`/recipes/${id}/edit`);

  const handleDeleteRecipe = async (id: number) => {
    if (!token) return;
    if (!window.confirm("¿Estás seguro que querés eliminar esta receta?")) return;

    try {
      const res = await fetch(`http://localhost:8080/api/recipes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      setRecipes(prev => prev.filter(r => r.id !== id));
    } catch {
      alert("No se pudo eliminar la receta.");
    }
  };

  /* render ---------------------------------------------------- */
  if (loading) return <p style={{ padding: "2rem" }}>Cargando…</p>;
  if (error)   return <p style={{ padding: "2rem" }}>{error}</p>;

  return (
      <>
        <button
            onClick={() => navigate("/profile")}
            style={styles.backBtn}
        >
          ←
        </button>

        <div style={styles.container}>
          <h2 style={styles.title}>Mis Recetas</h2>

          {recipes.length === 0 ? (
              <p>No tenés recetas creadas.</p>
          ) : (
              <>
                <div style={styles.grid}>
                  {recipes.map(r => (
                      <div key={r.id} style={styles.cardWrap}>
                        <button
                            style={styles.deleteButton}
                            title="Eliminar receta"
                            onClick={() => handleDeleteRecipe(r.id)}
                        >
                          ×
                        </button>

                        <div onClick={() => handleViewRecipe(r.id)}>
                          <RecipeCard recipe={r} />
                        </div>

                        <button
                            onClick={() => handleEditRecipe(r.id)}
                            style={styles.editBtn}
                        >
                          ✏️ Editar
                        </button>
                      </div>
                  ))}
                </div>

                {hasMore && (
                    <button
                        style={styles.loadBtn}
                        onClick={() => setPage(p => p + 1)}
                    >
                      Ver más recetas
                    </button>
                )}
              </>
          )}
        </div>
      </>
  );
};

/* -------- estilos -------- */
const styles: Record<string, React.CSSProperties> = {
  backBtn: {
    background: "none",
    border: "none",
    fontSize: "2rem",
    cursor: "pointer",
    color: "#A6B240",
    position: "absolute",
    top: "20px",
    left: "20px",
    zIndex: 999,
  },
  container: {
    padding: "2rem",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  title: {
    fontSize: "2rem",
    marginBottom: "1rem",
    textAlign: "center",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "1.5rem",
  },
  cardWrap: { position: "relative" },
  deleteButton: {
    position: "absolute",
    top: "10px",
    right: "10px",
    background: "#ff4d4d",
    color: "#fff",
    border: "none",
    borderRadius: "50%",
    width: "25px",
    height: "25px",
    cursor: "pointer",
    fontSize: "1rem",
    lineHeight: "25px",
    textAlign: "center",
    zIndex: 2,
  },
  editBtn: {
    marginTop: "0.5rem",
    background: "#007bff",
    color: "#fff",
    border: "none",
    padding: "0.4rem 0.8rem",
    borderRadius: "5px",
    cursor: "pointer",
  },
  loadBtn: {
    margin: "1.5rem auto",
    display: "block",
    padding: "0.6rem 1.2rem",
    backgroundColor: "#A6B240",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: 600,
  },
};

export default MyRecipes;
