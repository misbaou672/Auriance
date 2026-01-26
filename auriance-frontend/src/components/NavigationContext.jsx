// src/contexts/NavigationContext.jsx
import React, { createContext, useContext, useState } from 'react';

const NavigationContext = createContext();

export function NavigationProvider({ children }) {
    const [currentSection, setCurrentSection] = useState('hero');
    const [direction, setDirection] = useState('next');

    const navigateTo = (section, navDirection = 'next') => {
        setDirection(navDirection);
        setCurrentSection(section);
    };

    return (
        <NavigationContext.Provider value={{ currentSection, navigateTo, direction }}>
            {children}
        </NavigationContext.Provider>
    );
}

export function useNavigation() {
    const context = useContext(NavigationContext);
    if (!context) {
        throw new Error('useNavigation must be used within a NavigationProvider');
    }
    return context;
}