import React, { useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import FAQ from '../../components/FAQ';
import CTA from '../../components/CTA';

export default function FAQPage({ onNavigate, onNavigateToLogin, currentUser, onNavigateToDashboard }) {
    const [isDark, setIsDark] = useState(true);

    return (
        <main className={`min-h-screen transition-colors duration-500 ${isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
            <Header
                onNavigate={onNavigate}
                onNavigateToLogin={onNavigateToLogin}
                currentUser={currentUser}
                onNavigateToDashboard={onNavigateToDashboard}
                isDark={isDark}
            />

            <div className="pt-24">
                <FAQ isDark={isDark} />
            </div>

            <div className="pb-20">
                <CTA isDark={isDark} />
            </div>

            <Footer isDark={isDark} />

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
