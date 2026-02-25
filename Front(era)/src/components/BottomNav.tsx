import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useFloatingMenu } from "../context/FloatingMenuContext";

const BottomNav: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { toggleMenu } = useFloatingMenu();

    const navItems = [
        { icon: "🏠", path: "/home" },
        { icon: "🔍", path: "/search" },
        { icon: "➕", action: toggleMenu },
        { icon: "🛒", path: "/shopping-list" },
        { icon: "👤", path: "/profile" }
    ];

    return (
        <nav style={styles.navbar}>
            {navItems.map((item, index) => {
                const isActive = item.path === location.pathname;
                return (
                    <button
                        key={index}
                        onClick={() => item.path ? navigate(item.path) : item.action?.()}
                        data-floating-menu-toggle={item.action ? "true" : undefined}
                        style={{
                            ...styles.button,
                            backgroundColor: isActive ? "#A6B240" : "transparent",
                            color: isActive ? "#fff" : "#333"
                        }}
                    >
                        <span style={styles.icon}>{item.icon}</span>
                    </button>
                );
            })}
        </nav>
    );
};

const styles: Record<string, React.CSSProperties> = {
    navbar: {
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        backgroundColor: '#fff',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '0.5rem 0',
        borderTop: '1px solid #ccc',
        zIndex: 900
    },
    button: {
        background: 'transparent',
        border: 'none',
        fontSize: '1.5rem',
        cursor: 'pointer',
        padding: '0.5rem',
        borderRadius: '50%',
        transition: 'background-color 0.2s ease'
    },
    icon: {
        fontSize: '1.6rem'
    }
};

export default BottomNav;
