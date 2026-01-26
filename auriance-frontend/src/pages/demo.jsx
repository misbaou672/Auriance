import React, { useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Pricing from '../components/Pricing';
import Security from '../components/Security';
import FAQ from '../components/FAQ';
import CTA from '../components/CTA';
import TranscriptionDemo from '../components/TranscriptionDemo';
import DemoInteractive from '../components/DemoInteractive';

export default function Demo({ onNavigate, onNavigateToLogin, currentUser, onNavigateToDashboard }) {
    const [isDark, setIsDark] = useState(true);

    return (
        <main className={`fixed inset-0 z-50 overflow-y-auto w-full h-full transition-colors duration-500 ease-in-out ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                <div className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-50 transition-colors duration-700 ${isDark ? 'bg-indigo-500/10' : 'bg-indigo-500/5'}`} />
                <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-50 transition-colors duration-700 ${isDark ? 'bg-violet-500/10' : 'bg-violet-500/5'}`} />
                <div className={`absolute top-1/2 left-1/2 w-96 h-96 rounded-full blur-3xl opacity-50 transition-colors duration-700 ${isDark ? 'bg-blue-500/5' : 'bg-blue-500/5'}`} />
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
                <Hero isDark={isDark} />
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
            `}</style>
        </main>
    );
}