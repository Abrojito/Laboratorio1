import { useEffect, useState } from "react";
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

interface Collection {
    id: number;
    name: string;
    recipes: Recipe[];
    mealPreps: MealPrep[];
}

const CollectionsPage = () => {
    const [collections, setCollections] = useState<Collection[]>([]);

    useEffect(() => {
        const token = localStorage.getItem("token") || "";
        fetchCollections(token).then(setCollections);
    }, []);

    return (
        <div style={{ padding: "2rem", maxWidth: "900px", margin: "auto" }}>
            <h1 style={{ marginBottom: "1.5rem" }}>Tus colecciones</h1>

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
    );
};

export default CollectionsPage;
