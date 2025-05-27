import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from "../components/BackButton.tsx";

interface Recipe {
  id: number;
  name: string;
  description: string;
  image: string;
  publicRecipe: boolean;
}

const MyRecipes: React.FC = () => {
  const navigate = useNavigate();
  const [myRecipes, setMyRecipes] = useState<Recipe[]>([]);
  const [error, setError] = useState<string | null>(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/start');
      return;
    }
    fetchMyRecipes();
  }, [token, navigate]);

  const fetchMyRecipes = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/users/me/recipes', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setMyRecipes(data);
    } catch (err) {
      setError('Error cargando tus recetas.');
    }
  };

  const handleViewRecipe = (id: number) => {
    navigate(`/recipes/${id}`);
  };

  const handleDeleteRecipe = async (id: number) => {
    if (!token) return;

    const confirmDelete = window.confirm('¿Estás seguro que querés eliminar esta receta?');
    if (!confirmDelete) return;

    try {
      const res = await fetch(`http://localhost:8080/api/recipes/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Error al eliminar la receta');

      setMyRecipes(prev => prev.filter(recipe => recipe.id !== id));
    } catch (err) {
      alert('No se pudo eliminar la receta.');
    }
  };

  const handleEditRecipe = (id: number) => {
    navigate(`/recipes/${id}/edit`);
  };


  return (
      <div>
        <BackButton />
      <div style={styles.container}>
        <h2 style={styles.title}>Mis Recetas</h2>

        {myRecipes.length === 0 ? (
            <p>No tenés recetas creadas.</p>
        ) : (
            <div style={styles.grid}>
              {myRecipes.map((recipe) => (
                  <div
                      key={recipe.id}
                      style={styles.card}
                  >
                    <button
                        style={styles.deleteButton}
                        onClick={() => handleDeleteRecipe(recipe.id)}
                        title="Eliminar receta"
                    >
                      ×
                    </button>

                    <div onClick={() => handleViewRecipe(recipe.id)} style={{ cursor: 'pointer' }}>
                      <img
                          src={recipe.image || '/default-recipe.png'}
                          alt={recipe.name}
                          style={styles.image}
                      />
                      <h3 style={styles.cardTitle}>{recipe.name}</h3>
                      <p style={styles.cardDesc}>{recipe.description}</p>
                    </div>

                    {/* ✅ Botón de editar */}
                    <button
                        onClick={() => handleEditRecipe(recipe.id)}
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

export default MyRecipes;
