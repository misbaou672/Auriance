import React, { useState } from 'react';
import { ArrowLeft, Sun, Moon } from 'lucide-react';
import Features from '../../components/Features';

const FeaturesPage = ({ onBack }) => {
    const [isDark, setIsDark] = useState(true);

    return (
        <main className={`fixed inset-0 z-[150] overflow-y-auto w-full h-full transition-colors duration-500 ease-in-out ${isDark ? 'bg-[#0f1016]' : 'bg-slate-50'}`}>

            {/* Navigation Bar Flottante */}
            <nav className={`fixed top-6 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-full border backdrop-blur-xl transition-all duration-300 ${isDark
                ? 'bg-white/5 border-white/10 shadow-2xl shadow-black/50'
                : 'bg-white/80 border-slate-200 shadow-xl shadow-slate-200/50'
                }`}>
                <div className="flex items-center gap-6">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (onBack) onBack();
                            else window.history.back();
                        }}
                        className={`p-2.5 rounded-full transition-all duration-300 group ${isDark ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
                            }`}
                        title="Retour"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <button
                        onClick={() => onBack && onBack()}
                        className={`font-bold text-sm tracking-wide transition-opacity hover:opacity-100 ${isDark ? 'text-white' : 'text-slate-900'} opacity-80`}
                    >
                        Fonctionnalités
                    </button>
                    <div className={`w-px h-4 bg-current opacity-20 ${isDark ? 'text-white' : 'text-slate-900'}`} />
                    <button
                        onClick={() => setIsDark(!isDark)}
                        className={`p-2 rounded-full transition-colors ${isDark ? 'text-yellow-400 hover:bg-white/10' : 'text-slate-900 hover:bg-slate-100'
                            }`}
                    >
                        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </button>
                </div>
            </nav>

            <Features isDark={isDark} />
        </main>
    );
};

export default FeaturesPage;
