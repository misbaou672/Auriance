import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const MarketingLayout = ({ currentUser }) => {
    return (
        <div className="flex flex-col min-h-screen bg-neutral-900 text-white selection:bg-indigo-500/30">
            {/* Le Header utilisera désormais la navigation du routeur via des adaptations ou modifications futures */}
            <Header currentUser={currentUser} />

            <main className="flex-grow">
                <Outlet />
            </main>

            <Footer />
        </div>
    );
};

export default MarketingLayout;
