import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {useNavigate} from "react-router-dom";

interface Collection {
    id: number;
    name: string;
    recipes: Recipe[];
    mealPreps: MealPrep[];
}

const CollectionsPage = () => {
    const [collections, setCollections] = useState<Collection[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token") || "";
        fetchCollections(token).then(setCollections);
    }, []);

    return (
        <>
            <button
                onClick={() => navigate('/profile')}
                style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '2rem',
                    cursor: 'pointer',
                    color: '#A6B240',
                    position: 'absolute',
                    top: '20px',
                    left: '20px',
                    zIndex: 999,
                }}
            >
                ←
            </button>
        <div style={{ padding: "2rem", maxWidth: "900px", margin: "auto" }}>
            <h1 style={{ marginBottom: "1.5rem", marginTop: "2.5rem" }}>Tus colecciones</h1>

            {collections.length === 0 ? (
                <p>No tenés colecciones guardadas.</p>
            ) : (
                collections.map((collection) => (
                    <Accordion key={collection.id}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h6">{collection.name}</Typography>
                        </AccordionSummary>

                        <AccordionDetails>
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                                    gap: "1.5rem",
                                    paddingTop: "1rem",
                                }}
                            >
                                {collection.recipes.map((recipe) => (
                                    <RecipeCard key={`recipe-${recipe.id}`} recipe={recipe} />
                                ))}
                                {collection.mealPreps.map((mealPrep) => (
                                    <MealPrepCard key={`mealprep-${mealPrep.id}`} mealPrep={mealPrep} />
                                ))}
                            </div>
                        </AccordionDetails>
                    </Accordion>
                ))
            )}
        </div>
       </>
    );
};

export default CollectionsPage;
