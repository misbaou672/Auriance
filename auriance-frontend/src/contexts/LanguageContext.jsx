// src/contexts/LanguageContext.jsx
import React, { createContext, useContext, useState } from 'react';
import { TRANSLATIONS } from '../translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    const [currentLanguage, setCurrentLanguage] = useState('FR');

    const changeLanguage = (languageCode) => {
        setCurrentLanguage(languageCode);
    };

    // Helper function to get nested translation keys (e.g., "nav.features")
    const t = (path) => {
        const keys = path.split('.');
        let value = TRANSLATIONS[currentLanguage];

        for (const key of keys) {
            if (value && value[key]) {
                value = value[key];
            } else {
                // Fallback to FR/EN if missing, or return key
                return path;
            }
        }
        return value;
    };

    return (
        <LanguageContext.Provider value={{ currentLanguage, changeLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}