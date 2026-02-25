// src/context/FloatingMenuContext.tsx
import React, { createContext, useState, useContext, useCallback, useMemo } from "react";

interface FloatingMenuContextType {
    showMenu: boolean;
    toggleMenu: () => void;
    closeMenu: () => void;
}

const FloatingMenuContext = createContext<FloatingMenuContextType | undefined>(undefined);

export const FloatingMenuProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [showMenu, setShowMenu] = useState(false);

    const toggleMenu = useCallback(() => setShowMenu(prev => !prev), []);
    const closeMenu = useCallback(() => setShowMenu(false), []);
    const value = useMemo(() => ({ showMenu, toggleMenu, closeMenu }), [showMenu, toggleMenu, closeMenu]);

    return (
        <FloatingMenuContext.Provider value={value}>
            {children}
        </FloatingMenuContext.Provider>
    );
};

export const useFloatingMenu = () => {
    const context = useContext(FloatingMenuContext);
    if (!context) throw new Error("useFloatingMenu must be used within FloatingMenuProvider");
    return context;
};
