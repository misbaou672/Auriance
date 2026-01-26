// src/pages/Home.jsx
import React, { useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Hero from '../components/Hero';
import Pricing from '../components/Pricing';
import Security from '../components/Security';
import FAQ from '../components/FAQ';
import CTA from '../components/CTA';
import Features from '../components/Features';
import DemoInteractive from '../components/DemoInteractive';
import TranscriptionDemo from '../components/TranscriptionDemo';

export default function Home({ onNavigate, onNavigateToDemo, onNavigateToLogin, currentUser, onNavigateToDashboard }) {
    const [isDark, setIsDark] = useState(true);

    return (
        <main className={`fixed inset-0 z-50 overflow-y-auto w-full h-full transition-colors duration-500 ease-in-out ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                <div className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-50 transition-colors duration-700 ${isDark ? 'bg-cyan-500/10' : 'bg-cyan-500/5'}`} />
                <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-50 transition-colors duration-700 ${isDark ? 'bg-violet-500/10' : 'bg-violet-500/5'}`} />
                <div className={`absolute top-1/2 left-1/2 w-96 h-96 rounded-full blur-3xl opacity-50 transition-colors duration-700 ${isDark ? 'bg-rose-500/5' : 'bg-rose-500/5'}`} />
            </div>

            {/* Theme Toggle Button (Floating) */}
            <div className="fixed top-24 right-6 z-50">
                <button
                    onClick={() => setIsDark(!isDark)}
                    className={`p-3 rounded-full transition-all duration-300 shadow-lg ${isDark
                        ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700 border border-slate-700'
                        : 'bg-white text-slate-900 hover:bg-slate-100 border border-slate-200'
                        }`}
                    title={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
                >
                    {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
            </div>

            {/* Content Wrapper */}
            <div className={`relative ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                <Header
                    onNavigate={onNavigate}
                    onNavigateToLogin={onNavigateToLogin}
                    currentUser={currentUser}
                    onNavigateToDashboard={onNavigateToDashboard}
                    isDark={isDark}
                />
                <Hero onNavigateToDemo={onNavigateToDemo} isDark={isDark} />
                <Features isDark={isDark} />
                <DemoInteractive isDark={isDark} />
                <TranscriptionDemo isDark={isDark} />
                <Pricing isDark={isDark} />
                <Security isDark={isDark} />
                <FAQ isDark={isDark} />
                <CTA isDark={isDark} />
                <Footer isDark={isDark} />
            </div>

            <style>{`
                ::-webkit-scrollbar {
                    width: 8px;
                }
                ::-webkit-scrollbar-track {
                    background: ${isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.05)'};
                }
                ::-webkit-scrollbar-thumb {
                    background: ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.2)'};
                    border-radius: 4px;
                }
                ::-webkit-scrollbar-thumb:hover {
                    background: ${isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.3)'};
                }

                ${isDark ? `
                    /* HACK DEEP TECH: Force la transparence sur les composants enfants pour révéler le fond cosmique */
                    main section:not(header), main footer {
                        background-color: transparent !important;
                    }
                    
                    /* Écrase les bg-white de Tailwind (sauf dans le header) */
                    main :not(header) .bg-white {
                        background-color: transparent !important;
                        color: #f8fafc !important; /* text-slate-50 */
                    }
                    main :not(header) .text-gray-900, 
                    main :not(header) .text-gray-800, 
                    main :not(header) .text-gray-700, 
                    main :not(header) .text-gray-600 {
                        color: #cbd5e1 !important; /* text-slate-300 */
                    }

                    /* Transforme les cartes et blocs blancs en Glassmorphism sombre (sauf dans le header) */
                    main :not(header) .shadow-lg, 
                    main :not(header) .shadow-xl, 
                    main :not(header) .shadow-2xl, 
                    main :not(header) .rounded-2xl.bg-white {
                        background-color: rgba(0, 0, 0, 0.4) !important;
                        border: 1px solid rgba(255, 255, 255, 0.1) !important;
                        backdrop-filter: blur(12px) !important;
                        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5) !important;
                    }

                    /* Préserve les boutons (souvent bg-blue-600, etc.) mais ajuste le texte si nécessaire */
                    main button:not(.bg-white) {
                        /* On laisse les boutons de couleur tranquilles */
                    }
                    main :not(header) button.bg-white {
                        background-color: rgba(255, 255, 255, 0.1) !important;
                        color: white !important;
                        border: 1px solid rgba(255, 255, 255, 0.2) !important;
                    }
                ` : ''}
            `}</style>
        </main>
    );
}