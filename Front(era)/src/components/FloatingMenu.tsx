import React from 'react';
import { useFloatingMenu } from '../context/FloatingMenuContext';
import { useNavigate } from 'react-router-dom';

const FloatingMenu: React.FC = () => {
    const { showMenu } = useFloatingMenu();
    const navigate = useNavigate();

    if (!showMenu) return null;

    return (
        <div style={styles.menu}>
            <button onClick={() => navigate('/newrecipe')} style={styles.menuItem}>➕ Nueva Receta</button>
            <button onClick={() => navigate('/new-mealprep')} style={styles.menuItem}>➕ Nuevo MealPrep</button>
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    menu: {
        position: 'fixed', bottom: '110px', left: '50%',
        transform: 'translateX(-50%)',
        background: '#fff', borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.15)', padding: '0.5rem',
        display: 'flex', flexDirection: 'column', gap: '0.5rem',
        zIndex: 1000
    },
    menuItem: {
        background: '#A6B240', color: '#fff',
        border: 'none', padding: '0.5rem 1rem',
        borderRadius: '8px', cursor: 'pointer', fontSize: '1rem',
        textAlign: 'center'
    }
};

export default FloatingMenu;
