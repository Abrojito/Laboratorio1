import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { fetchCollections } from "../api/collectionApi";
import { Recipe } from "../types/Recipe";
import { MealPrep } from "../types/MealPrep";

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

/* -------------- componente ------------------ */
const CollectionsPage: React.FC = () => {
    const navigate = useNavigate();
    const [collections, setCollections] = useState<Collection[]>([]);

    /* cuántos ítems mostramos por colección */
    const [visibleCount, setVisibleCount] = useState<Record<number, number>>({});

    useEffect(() => {
        const token = localStorage.getItem("token") || "";
        fetchCollections(token).then(cols => {
            setCollections(cols);
            /* inicia visible=3 para cada colección */
            const init: Record<number, number> = {};
            cols.forEach(c => (init[c.id] = 3));
            setVisibleCount(init);
        });
    }, []);

    const handleLoadMore = (colId: number) =>
        setVisibleCount(prev => ({ ...prev, [colId]: prev[colId] + 3 }));

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
                    collections.map(col => {
                        /* mezclamos recetas y meal-preps en un solo array conservando orden original */
                        const items = [
                            ...col.recipes.map(r => ({ type: "recipe" as const, data: r })),
                            ...col.mealPreps.map(m => ({ type: "mealprep" as const, data: m })),
                        ];

                        const visible = items.slice(0, visibleCount[col.id] ?? 3);
                        const hasMore = visible.length < items.length;

                        return (
                            <Accordion key={col.id}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography variant="h6">{col.name}</Typography>
                                </AccordionSummary>

                                <AccordionDetails>
                                    <div style={styles.grid}>
                                        {visible.map((item, idx) =>
                                            item.type === "recipe" ? (
                                                <RecipeCard key={`r-${item.data.id}-${idx}`} recipe={item.data} />
                                            ) : (
                                                <MealPrepCard key={`mp-${item.data.id}-${idx}`} mealPrep={item.data} />
                                            )
                                        )}
                                    </div>

                                    {hasMore && (
                                        <Button
                                            variant="contained"
                                            sx={{ mt: 2 }}
                                            onClick={() => handleLoadMore(col.id)}
                                        >
                                            Ver más
                                        </Button>
                                    )}
                                </AccordionDetails>
                            </Accordion>
                        );
                    })
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
};

export default CollectionsPage;
