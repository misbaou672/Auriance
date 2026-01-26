import React from 'react';
import Hero from '../../components/Hero.jsx';
import Features from '../../components/Features.jsx';
import TranscriptionDemo from '../../components/TranscriptionDemo.jsx';
import Pricing from '../../components/Pricing.jsx';
import Security from '../../components/Security.jsx';
import FAQ from '../../components/FAQ.jsx';
import CTA from '../../components/CTA.jsx';

const MarketingHome = ({ onNavigateToFeatures, onNavigateToContact, onNavigateToDemo }) => {
    return (
        <main className="min-h-screen">
            <Hero onNavigateToDemo={onNavigateToDemo} />
            <Features />
            <TranscriptionDemo />
            <Pricing onNavigateToContact={onNavigateToContact} />
            <Security />
            <FAQ />
            <CTA onNavigateToContact={onNavigateToContact} onNavigateToFeatures={onNavigateToFeatures} />
        </main>
    );
};

export default MarketingHome;
