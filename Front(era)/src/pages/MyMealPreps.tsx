import React, { useEffect, useState } from "react";
import { fetchMyMealPreps, deleteMealPrep } from "../api/mealPrepApi";
import { MealPrep } from "../types/MealPrep";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";

const MyMealPreps: React.FC = () => {
    const navigate = useNavigate();
    const [mealPreps, setMealPreps] = useState<MealPrep[]>([]);
    const [error, setError] = useState<string | null>(null);
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token) {
            navigate('/start');
            return;
        }
        fetchMyMealPreps(token)
            .then(setMealPreps)
            .catch(err => {
                console.error(err);
                setError("Error cargando tus meal preps.");
            });
    }, [token, navigate]);

    const handleViewMealPrep = (id: number) => {
        navigate(`/mealpreps/${id}`);
    };

    const handleDeleteMealPrep = async (id: number) => {
        if (!token) return;

        const confirmDelete = window.confirm('¿Estás seguro que querés eliminar este meal prep?');
        if (!confirmDelete) return;

        try {
            await deleteMealPrep(id, token);
            setMealPreps(prev => prev.filter(mp => mp.id !== id));
        } catch (err) {
            alert('No se pudo eliminar el meal prep.');
        }
    };

    const handleEditMealPrep = (id: number) => {
        navigate(`/mealpreps/${id}/edit`);
    };

    return (
        <div>
            <BackButton />
            <div style={styles.container}>
                <h2 style={styles.title}>Mis Meal Preps</h2>

                {mealPreps.length === 0 ? (
                    <p>No tenés meal preps creados.</p>
                ) : (
                    <div style={styles.grid}>
                        {mealPreps.map((mp) => (
                            <div key={mp.id} style={styles.card}>
                                <button
                                    style={styles.deleteButton}
                                    onClick={() => handleDeleteMealPrep(mp.id)}
                                    title="Eliminar meal prep"
                                >
                                    ×
                                </button>

                                <div onClick={() => handleViewMealPrep(mp.id)} style={{ cursor: 'pointer' }}>
                                    <img
                                        src={mp.image || '/default-recipe.png'}
                                        alt={mp.name}
                                        style={styles.image}
                                    />
                                    <h3 style={styles.cardTitle}>{mp.name}</h3>
                                    <p style={styles.cardDesc}>{mp.description}</p>
                                </div>

                                <button
                                    onClick={() => handleEditMealPrep(mp.id)}
                                    style={{
                                        marginTop: '0.5rem',
                                        background: '#007bff',
                                        color: 'white',
                                        border: 'none',
                                        padding: '0.4rem 0.8rem',
                                        borderRadius: '5px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    ✏️ Editar
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {error && <div style={styles.error}>{error}</div>}
            </div>
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    container: {
        padding: '2rem',
        maxWidth: '1200px',
        margin: '0 auto',
    },
    title: {
        fontSize: '2rem',
        marginBottom: '1rem',
        textAlign: 'center',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
    },
    card: {
        position: 'relative',
        background: '#f8f8f8',
        padding: '1rem',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        textAlign: 'center',
        transition: 'transform 0.2s',
    },
    deleteButton: {
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: '#ff4d4d',
        color: '#fff',
        border: 'none',
        borderRadius: '50%',
        width: '25px',
        height: '25px',
        cursor: 'pointer',
        fontSize: '1rem',
        lineHeight: '25px',
        textAlign: 'center',
    },
    image: {
        width: '100%',
        height: '200px',
        objectFit: 'cover',
        borderRadius: '8px',
        marginBottom: '1rem',
    },
    cardTitle: {
        fontSize: '1.2rem',
        fontWeight: 600,
        marginBottom: '0.5rem',
    },
    cardDesc: {
        fontSize: '0.9rem',
        color: '#555',
    },
    error: {
        marginTop: '2rem',
        backgroundColor: '#ffe6e6',
        padding: '1rem',
        borderRadius: '8px',
        textAlign: 'center',
        color: '#b30000',
    },
};

export default MyMealPreps;
