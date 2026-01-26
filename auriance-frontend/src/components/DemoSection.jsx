import React, { useState } from 'react';

export default function DemoSection() {
    const [activeTab, setActiveTab] = useState('transcription');

    const demos = {
        transcription: {
            title: "Transcription en temps réel",
            content: "Réunion avec le client pour le projet Quartz. Objectifs: livraison pour le 15 mars, budget approuvé à 75K€. Équipe: 3 développeurs, 1 designer. Prochain point: semaine prochaine pour revue des maquettes.",
            tags: ["Réunion", "Notes", "Transcription"]
        },
        courrier: {
            title: "Génération de documents",
            content: "Objet: Proposition de partenariat\n\nCher partenaire,\nSuite à notre échange, voici notre proposition de collaboration pour le projet Nova. Nous sommes convaincus que notre expertise peut apporter une valeur significative à votre initiative.\n\nCordialement,",
            tags: ["Document", "Professionnel", "Généré automatiquement"]
        },
        formulaire: {
            title: "Remplissage automatique",
            content: "Formulaire de suivi - Projet Aurora\nStatut: En cours\nAvancement: 65%\nÉchéance: 30 avril\nÉquipe assignée: 5 membres\nBudget restant: 25K€",
            tags: ["Suivi", "Formulaire", "Automatique"]
        }
    };

    return (
        <section className="py-20" style={{ backgroundColor: '#fbf8f3' }}>
            <div className="max-w-6xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-5xl font-bold text-gray-900 mb-6">
                        Une interface conçue pour votre productivité
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Découvrez comment Auriance transforme votre quotidien professionnel
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    {/* Navigation des fonctionnalités */}
                    <div className="space-y-4">
                        <button
                            onClick={() => setActiveTab('transcription')}
                            className={`w-full text-left p-6 rounded-2xl border-2 transition-all duration-300 ${activeTab === 'transcription'
                                ? 'border-blue-500 bg-blue-50 shadow-lg'
                                : 'border-gray-200 bg-white hover:border-gray-300'
                                }`}
                        >
                            <h3 className="text-xl font-semibold mb-2">🎙️ Transcription vocale</h3>
                            <p className="text-gray-600">Retranscription automatique de vos réunions et discussions</p>
                        </button>

                        <button
                            onClick={() => setActiveTab('courrier')}
                            className={`w-full text-left p-6 rounded-2xl border-2 transition-all duration-300 ${activeTab === 'courrier'
                                ? 'border-blue-500 bg-blue-50 shadow-lg'
                                : 'border-gray-200 bg-white hover:border-gray-300'
                                }`}
                        >
                            <h3 className="text-xl font-semibold mb-2">📝 Documents professionnels</h3>
                            <p className="text-gray-600">Génération automatique de courriers et rapports</p>
                        </button>

                        <button
                            onClick={() => setActiveTab('formulaire')}
                            className={`w-full text-left p-6 rounded-2xl border-2 transition-all duration-300 ${activeTab === 'formulaire'
                                ? 'border-blue-500 bg-blue-50 shadow-lg'
                                : 'border-gray-200 bg-white hover:border-gray-300'
                                }`}
                        >
                            <h3 className="text-xl font-semibold mb-2">📋 Formulaires intelligents</h3>
                            <p className="text-gray-600">Remplissage automatique des formulaires et documents</p>
                        </button>
                    </div>

                    {/* Zone de démonstration */}
                    <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-xl">
                        <div className="mb-6">
                            <div className="flex items-center space-x-2 mb-4">
                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-sm font-medium text-gray-600">DÉMONSTRATION EN DIRECT</span>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                {demos[activeTab].title}
                            </h3>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {demos[activeTab].tags.map((tag, index) => (
                                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full font-medium">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Contenu de démo */}
                        <div className="bg-gray-50 rounded-2xl border-2 border-gray-300 p-6 min-h-[200px] mb-6">
                            <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                                {demos[activeTab].content}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex space-x-3">
                            <button className="flex-1 bg-gray-900 text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition-all duration-300">
                                Copier le texte
                            </button>
                            <button className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:border-gray-400 transition-all duration-300">
                                Modifier
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}