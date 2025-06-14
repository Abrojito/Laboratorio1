// src/context/FloatingMenuContext.tsx
import React, { createContext, useState, useContext } from "react";

interface FloatingMenuContextType {
    showMenu: boolean;
    toggleMenu: () => void;
}

const FloatingMenuContext = createContext<FloatingMenuContextType | undefined>(undefined);

export const FloatingMenuProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [showMenu, setShowMenu] = useState(false);

    const toggleMenu = () => setShowMenu(prev => !prev);

    return (
        <FloatingMenuContext.Provider value={{ showMenu, toggleMenu }}>
            {children}
        </FloatingMenuContext.Provider>
    );
};

export const useFloatingMenu = () => {
    const context = useContext(FloatingMenuContext);
    if (!context) throw new Error("useFloatingMenu must be used within FloatingMenuProvider");
    return context;
};
