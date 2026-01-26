// src/components/StatsSection.jsx
import React from 'react';

export default function StatsSection() {
    const stats = [
        {
            number: "8 millions",
            text: "d'heures aux praticiens chaque année",
            icon: "⏱️"
        },
        {
            number: "2 millions",
            text: "de consultations chaque semaine",
            icon: "👥"
        },
        {
            number: "200",
            text: "professions et spécialités médicales",
            icon: "🎯"
        }
    ];

    return (
        <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-gray-900 mb-6">
                        Auriance dans le monde
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Des bénéfices concrets pour les professionnels de santé à travers le monde
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {stats.map((stat, index) => (
                        <div
                            key={index}
                            className="text-center p-8 bg-white rounded-3xl border-2 border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-500 hover:scale-105 transform group"
                        >
                            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                                {stat.icon}
                            </div>
                            <div className="text-3xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">
                                {stat.number}
                            </div>
                            <p className="text-gray-600 leading-relaxed">
                                {stat.text}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Citation */}
                <div className="text-center mt-16 max-w-4xl mx-auto">
                    <div className="bg-white rounded-3xl border-2 border-gray-200 p-8 hover:shadow-lg transition-all duration-500">
                        <div className="text-6xl text-gray-300 mb-4">"</div>
                        <p className="text-2xl text-gray-700 italic mb-6">
                            La conformité et la sécurité des données sont votre priorité, et nous savons que nous sommes entre de bonnes mains avec Auriance.
                        </p>
                        <div className="text-gray-600 font-medium">
                            - Médecin partenaire
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}