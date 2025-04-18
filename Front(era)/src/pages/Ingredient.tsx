import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Ingredient.css';
import {INGREDIENT_URL} from "../api/config.ts";

interface IngredientType {
    id: number;
    name: string;
}

const Ingredient: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const navigate = useNavigate();


    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Buscando ingredientes con el término:", searchTerm);

        try {
            const response = await fetch(`${INGREDIENT_URL}/search?term=${searchTerm}`, {
                method: 'GET',
            });
            const data = await response.json();
            console.log("Response:", data);
        }
        catch (error) {
            console.error('Error fetching ingredients:', error);
        }
    };

    const clearSearch = () => {
        setSearchTerm('');
    };

    return (
        <div className="ingredients-page">
            <div className="ingredients-header">
                <button className="back-button" onClick={() => navigate('/home')}>
                    ←
                </button>
                <h1>Lista de Ingredientes</h1>
            </div>

            <form className="search-bar" onSubmit={handleSearch}>
                <div className="search-input-container">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Buscar ingredientes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button
                            type="button"
                            className="clear-button"
                            onClick={clearSearch}
                        >
                            ×
                        </button>
                    )}
                </div>
                <button type="submit">Buscar</button>
            </form>

            {}
        </div>
    );
};

export default Ingredient;