import { useNavigate } from 'react-router-dom';
import { MealPrep } from '../types/MealPrep';

interface Props {
    mealPrep: MealPrep;
}

const MealPrepCard: React.FC<Props> = ({ mealPrep }) => {
    const navigate = useNavigate();
    const hasUndesired = mealPrep.hasUndesiredIngredients ?? false;

    return (
        <div
            onClick={() => navigate(`/mealpreps/${mealPrep.id}`)}
            style={{
                position: 'relative',
                background: '#f8f8f8',
                padding: '1rem',
                borderRadius: '10px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'transform 0.2s',
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

            {/* Public/Private tag */}
            <span
                style={{
                    position: 'absolute',
                    top: '10px',
                    right: '30px',
                    backgroundColor: mealPrep.publicMealPrep ? '#4caf50' : '#f44336',
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    zIndex: 3,
                }}
            >
                {mealPrep.publicMealPrep ? 'Public' : 'Private'}
            </span>

            {/* Image */}
            <img
                src={mealPrep.image || '/default-recipe.png'}
                alt={mealPrep.name}
                style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }}
            />

            {/* Name */}
            <h3 style={{ marginTop: '0.5rem' }}>{mealPrep.name}</h3>

            <small style={{ color:"#666" }}>⭐ {(mealPrep.averageRating ?? 0).toFixed(1)} ({mealPrep.ratingCount ?? 0})</small>


            {/* Description */}
            <p>{mealPrep.description}</p>

            {/* Optional: author */}
            <small style={{ color: '#666' }}>by {mealPrep.author}</small>
        </div>
    );
};

export default MealPrepCard;
