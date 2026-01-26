// src/components/PageContainer.jsx
import React from 'react';
import { useNavigation } from '../contexts/NavigationContext';
import Header from './Header';
import HeroSection from './sections/HeroSection';
import StatsSection from './sections/StatsSection';
import WorkflowSection from './sections/WorkflowSection';
import SecuritySection from './sections/SecuritySection';
import UseCasesSection from './sections/UseCasesSection';
import PricingSection from './sections/PricingSection';
import DemoSection from './sections/DemoSection';
import Footer from './Footer';

export default function PageContainer() {
    const { currentSection, direction } = useNavigation();

    const getSectionClass = (section) => {
        if (section === currentSection) {
            return direction === 'next'
                ? 'animate-slide-in-from-right'
                : 'animate-slide-in-from-left';
        }
        return 'hidden';
    };

    return (
        <div className="relative">
            <Header />

            {/* Sections avec transitions */}
            <div className="relative">
                {/* Section Hero */}
                <div className={getSectionClass('hero')}>
                    <HeroSection />
                </div>

                {/* Section Statistiques */}
                <div className={getSectionClass('stats')}>
                    <StatsSection />
                </div>

                {/* Section Processus */}
                <div className={getSectionClass('workflow')}>
                    <WorkflowSection />
                </div>

                {/* Section Démo Interactive */}
                <div className={getSectionClass('demo')}>
                    <DemoSection />
                </div>

                {/* Section Cas d'usage */}
                <div className={getSectionClass('usecases')}>
                    <UseCasesSection />
                </div>

                {/* Section Sécurité */}
                <div className={getSectionClass('security')}>
                    <SecuritySection />
                </div>

                {/* Section Tarifs */}
                <div className={getSectionClass('pricing')}>
                    <PricingSection />
                </div>
            </div>

            <Footer />
        </div>
    );
}