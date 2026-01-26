import React from 'react';

export default function SecuritySection() {
    const securityFeatures = [
        {
            icon: "🔒",
            title: "Vos données sont à vous",
            description: "Auriance ne conserve que les transcriptions et documents, aucun enregistrement audio n'est stocké."
        },
        {
            icon: "🗑️",
            title: "Suppression immédiate",
            description: "Les fichiers audio sont supprimés immédiatement après la transcription."
        },
        {
            icon: "🏢",
            title: "Normes professionnelles",
            description: "Respect des normes les plus strictes en matière de confidentialité et sécurité."
        },
        {
            icon: "🌐",
            title: "Conformité RGPD",
            description: "Conforme aux réglementations européennes et internationales sur la protection des données."
        }
    ];

    return (
        <section className="py-20 bg-gradient-to-br from-blue-50 to-white">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-gray-900 mb-6">
                        Une solution sécurisée pour votre activité
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Un assistant conçu par des professionnels, pour les professionnels
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    {securityFeatures.map((feature, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-2xl border-2 border-gray-200 p-6 text-center hover:border-blue-300 hover:shadow-lg transition-all duration-500 hover:scale-105 transform group"
                        >
                            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                                {feature.icon}
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                                {feature.title}
                            </h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Bandeau de confiance */}
                <div className="bg-white rounded-3xl border-2 border-gray-200 p-8 text-center hover:shadow-xl transition-all duration-500">
                    <div className="max-w-4xl mx-auto">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                            Approuvé en conditions réelles
                        </h3>
                        <p className="text-gray-600 text-lg mb-6">
                            Nos modèles sont traités et perfectionnés dans des conditions réelles de travail afin de garantir leur exactitude, leur fiabilité et leur conformité aux normes professionnelles.
                        </p>
                        <button className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-300 hover:scale-105 transform">
                            En savoir plus sur la sécurité
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}