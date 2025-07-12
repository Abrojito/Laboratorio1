import React, { useEffect, useState } from "react";
import {
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, IconButton, Pagination
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import IngredientSearch from "../components/IngredientSearch";
import { useNavigate } from "react-router-dom";

interface Ingredient { id: number; name: string; }
interface Page<T> {
    content: T[]; number: number; totalPages: number; totalElements: number;
}

const PAGE_SIZE = 10;

const UndesiredIngredients: React.FC = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem("token") || "";

    const [page, setPage] = useState(0);
    const [data, setData] = useState<Ingredient[]>([]);
    const [totalPages, setTotalPages] = useState(1);

    /* ----- fetch paginado ----- */
    const loadPage = async (p: number) => {
        const res = await fetch(
            `http://localhost:8080/api/undesired?page=${p}&size=${PAGE_SIZE}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error("Error al cargar lista");
        const pageJson: Page<Ingredient> = await res.json();
        setData(pageJson.content);
        setTotalPages(pageJson.totalPages || 1);
    };

    useEffect(() => { loadPage(page).catch(console.error); }, [page]);

    /* ----- acciones ----- */
    const handleRemove = async (id: number) => {
        await fetch(`http://localhost:8080/api/undesired/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });
        /* vuelvo a cargar la página actual */
        loadPage(page).catch(console.error);
    };

    const handleAdd = async (ing: Ingredient) => {
        /* POST al backend (ejemplo) */
        await fetch("http://localhost:8080/api/undesired", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ ingredientId: ing.id }),
        });
        /* recargo primer página */
        setPage(0);
    };

    /* ----- render ----- */
    return (
        <>
            <button onClick={() => navigate("/profile")} style={styles.backBtn}>←</button>

            <div style={{ padding: "2rem", maxWidth: "700px", margin: "auto" }}>
                <h1>Ingredientes no deseados</h1>
                <IngredientSearch onIngredientAdded={handleAdd} />

                <TableContainer component={Paper} sx={{ mt: 2 }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Ingrediente</TableCell>
                                <TableCell align="right">Quitar</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data.map(ing => (
                                <TableRow key={ing.id}>
                                    <TableCell>{ing.name}</TableCell>
                                    <TableCell align="right">
                                        <IconButton onClick={() => handleRemove(ing.id)} size="small" color="error">
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {data.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={2} align="center">Sin ingredientes</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Pagination
                    page={page + 1}
                    count={totalPages}
                    onChange={(_, v) => setPage(v - 1)}
                    sx={{ mt: 2, display: "flex", justifyContent: "center" }}
                />
            </div>
        </>
    );
};

/* estilos */
const styles: Record<string, React.CSSProperties> = {
    backBtn: {
        background: "none", border: "none", fontSize: "2rem", cursor: "pointer",
        color: "#A6B240", position: "absolute", top: 20, left: 20, zIndex: 999,
    },
};

export default UndesiredIngredients;
