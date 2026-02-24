import { useNavigate } from 'react-router-dom';
import { Recipe } from '../types/Recipe';

interface Props {
    recipe: Recipe;
}

const RecipeCard: React.FC<Props> = ({ recipe }) => {
    const navigate = useNavigate();
    const hasUndesired = recipe.hasUndesiredIngredients ?? false;

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
                        zIndex: 5,
                    }}
                />
            )}
            <img
                src={recipe.image || '/default-recipe.png'}
                alt={recipe.name}
                style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }}
            />
            <h3 style={{ marginTop: '0.5rem' }}>{recipe.name}</h3>
            <small style={{ color:"#666" }}>
                ⭐ {(recipe.averageRating ?? 0).toFixed(1)} ({recipe.ratingCount ?? 0})
            </small>

            <p>{recipe.description}</p>
            <small>
                {recipe.difficulty} · {recipe.category}
            </small>
        </div>
    );
};

export default RecipeCard;
