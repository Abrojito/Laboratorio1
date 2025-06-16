import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Recipe } from '../api/recipeApi';

interface Props {
    recipe: Recipe;
}

const RecipeCard: React.FC<Props> = ({ recipe }) => {
    const navigate = useNavigate();
    const [hasUndesired, setHasUndesired] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token') || '';
        fetch('http://localhost:8080/api/undesired', {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => {
                const ids = data.map((ing: any) => ing.id);

                // Verificar si la receta tiene alguno de los ingredientes no deseados
                const found = recipe.ingredients.some((ing) =>
                    ids.includes(ing.ingredientId)
                );
                setHasUndesired(found);
            })
            .catch((err) =>
                console.error('Error al cargar ingredientes no deseados', err)
            );
    }, [recipe.ingredients]);

    return (
        <div
            onClick={() => navigate(`/recipes/${recipe.id}`)}
            style={{
                background: '#f8f8f8',
                padding: '1rem',
                borderRadius: '10px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'transform 0.2s',
                position: 'relative',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
            {hasUndesired && (
                <div
                    style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: 'red',
                        boxShadow: '0 0 5px rgba(0,0,0,0.2)',
                    }}
                />
            )}
            <img
                src={recipe.image || '/default-recipe.png'}
                alt={recipe.name}
                style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }}
            />
            <h3 style={{ marginTop: '0.5rem' }}>{recipe.name}</h3>
            <p>{recipe.description}</p>
            <small>
                {recipe.difficulty} · {recipe.category}
            </small>
        </div>
    );
};

export default RecipeCard;
