import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import {
    fetchCollections,
    removeRecipeFromCollection,
    removeMealPrepFromCollection,
    fetchCollectionRecipesCursorPage
} from "../api/collectionApi";
import { Recipe } from "../types/Recipe";
import { MealPrep } from "../types/MealPrep";
import { useCursorPagination } from "../hooks/useCursorPagination";

import RecipeCard from "../components/RecipeCard";
import MealPrepCard from "../components/MealPrepCard";

import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography,
    Button,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

interface Collection {
    id: number;
    name: string;
    recipes: Recipe[];
    mealPreps: MealPrep[];
}

interface CollectionAccordionProps {
    collection: Collection;
    token: string;
}

const CollectionAccordion: React.FC<CollectionAccordionProps> = ({ collection, token }) => {
    const [mealPreps, setMealPreps] = useState<MealPrep[]>(collection.mealPreps);
    const [removedRecipeIds, setRemovedRecipeIds] = useState<number[]>([]);

    const {
        items: recipes,
        loadMore: loadMoreRecipes,
        isLoading: recipesLoading,
        hasNext: hasMoreRecipes,
        error: recipesError,
    } = useCursorPagination<Recipe>((cursor) =>
        fetchCollectionRecipesCursorPage(collection.id, cursor, 3, token)
    );

    const handleRemoveRecipe = async (recipeId: number) => {
        try {
            await removeRecipeFromCollection(collection.id, recipeId, token);
            setRemovedRecipeIds(prev => (prev.includes(recipeId) ? prev : [...prev, recipeId]));
        } catch (err) {
            console.error("No se pudo quitar la receta de la colección", err);
        }
    };

    const handleRemoveMealPrep = async (mealPrepId: number) => {
        try {
            await removeMealPrepFromCollection(collection.id, mealPrepId, token);
            setMealPreps(prev => prev.filter(mp => mp.id !== mealPrepId));
        } catch (err) {
            console.error("No se pudo quitar el meal prep de la colección", err);
        }
    };

    const visibleRecipes = recipes.filter(r => !removedRecipeIds.includes(r.id));
    const items = [
        ...visibleRecipes.map(r => ({ type: "recipe" as const, data: r })),
        ...mealPreps.map(m => ({ type: "mealprep" as const, data: m })),
    ];

    return (
        <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">{collection.name}</Typography>
            </AccordionSummary>

            <AccordionDetails>
                {recipesError && <p>{recipesError}</p>}

                {items.length === 0 ? (
                    <p>No hay items en esta colección.</p>
                ) : (
                    <div style={styles.grid}>
                        {items.map((item, idx) =>
                            item.type === "recipe" ? (
                                <div key={`r-${item.data.id}-${idx}`} style={styles.cardWrap}>
                                    <IconButton
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveRecipe(item.data.id);
                                        }}
                                        style={styles.removeBtn}
                                        title="Quitar"
                                    >
                                        <DeleteOutlineIcon />
                                    </IconButton>
                                    <RecipeCard recipe={item.data} />
                                </div>
                            ) : (
                                <div key={`mp-${item.data.id}-${idx}`} style={styles.cardWrap}>
                                    <IconButton
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveMealPrep(item.data.id);
                                        }}
                                        style={styles.removeBtn}
                                        title="Quitar"
                                    >
                                        <DeleteOutlineIcon />
                                    </IconButton>
                                    <MealPrepCard mealPrep={item.data} />
                                </div>
                            )
                        )}
                    </div>
                )}

                {hasMoreRecipes && (
                    <Button
                        variant="contained"
                        sx={{ mt: 2 }}
                        onClick={loadMoreRecipes}
                        disabled={recipesLoading}
                    >
                        {recipesLoading ? "Cargando..." : "Cargar más"}
                    </Button>
                )}
            </AccordionDetails>
        </Accordion>
    );
};

/* -------------- componente ------------------ */
const CollectionsPage: React.FC = () => {
    const navigate = useNavigate();
    const [collections, setCollections] = useState<Collection[]>([]);
    const token = localStorage.getItem("token") || "";

    useEffect(() => {
        fetchCollections(token).then(cols => {
            setCollections(cols);
        });
    }, [token]);

    return (
        <>
            <button onClick={() => navigate("/profile")} style={styles.backBtn}>
                ←
            </button>

            <div style={{ padding: "2rem", maxWidth: "900px", margin: "auto" }}>
                <h1 style={{ marginBottom: "1.5rem", marginTop: "2.5rem" }}>
                    Tus colecciones
                </h1>

                {collections.length === 0 ? (
                    <p>No tenés colecciones guardadas.</p>
                ) : (
                    collections.map(col => (
                        <CollectionAccordion key={col.id} collection={col} token={token} />
                    ))
                )}
            </div>
        </>
    );
};

/* ---------- estilos ---------- */
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
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "1.5rem",
    },
    cardWrap: {
        position: "relative",
    },
    removeBtn: {
        position: "absolute",
        top: 10,
        right: 10,
        zIndex: 4,
        color: "#d32f2f",
        backgroundColor: "rgba(255,255,255,0.9)",
    },
};

export default CollectionsPage;
