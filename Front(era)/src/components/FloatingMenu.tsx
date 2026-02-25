import React, { useEffect, useRef } from 'react';
import { useFloatingMenu } from '../context/FloatingMenuContext';
import { useLocation, useNavigate } from 'react-router-dom';

const FloatingMenu: React.FC = () => {
    const { showMenu, closeMenu } = useFloatingMenu();
    const navigate = useNavigate();
    const location = useLocation();
    const menuRef = useRef<HTMLDivElement | null>(null);
    const lastPathRef = useRef(location.pathname);

    useEffect(() => {
        if (!showMenu) return;

        const handleOutsidePointer = (event: MouseEvent | TouchEvent) => {
            const target = event.target as HTMLElement | null;
            if (!target) return;

            if (target.closest('[data-floating-menu-toggle="true"]')) return;
            if (menuRef.current?.contains(target)) return;

            closeMenu();
        };

        const handleScroll = () => closeMenu();

        document.addEventListener("mousedown", handleOutsidePointer);
        document.addEventListener("touchstart", handleOutsidePointer);
        window.addEventListener("scroll", handleScroll, { passive: true });

        return () => {
            document.removeEventListener("mousedown", handleOutsidePointer);
            document.removeEventListener("touchstart", handleOutsidePointer);
            window.removeEventListener("scroll", handleScroll);
        };
    }, [closeMenu, showMenu]);

    useEffect(() => {
        if (lastPathRef.current !== location.pathname) {
            closeMenu();
            lastPathRef.current = location.pathname;
        }
    }, [location.pathname, closeMenu]);

    if (!showMenu) return null;

    return (
        <div ref={menuRef} style={styles.menu}>
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
        zIndex: 900
    },
    menuItem: {
        background: '#A6B240', color: '#fff',
        border: 'none', padding: '0.5rem 1rem',
        borderRadius: '8px', cursor: 'pointer', fontSize: '1rem',
        textAlign: 'center'
    }
};

export default FloatingMenu;
