import React, { useState } from 'react';

export default function WorkflowSection() {
    const [activeStep, setActiveStep] = useState(0);

    const steps = [
        {
            icon: "🎙️",
            title: "Transcrivez",
            description: "Lancez la transcription au début de vos réunions ou discussions, et capturez tous les détails pertinents.",
            color: "blue"
        },
        {
            icon: "🎯",
            title: "Personnalisez",
            description: "Choisissez votre modèle favori et laissez Auriance générer des documents adaptés à votre style professionnel.",
            color: "purple"
        },
        {
            icon: "📄",
            title: "Générez les résultats",
            description: "Rapports, courriers, formulaires : Auriance conçoit tout automatiquement pour vous.",
            color: "green"
        }
    ];

    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-gray-900 mb-6">
                        Comment Auriance s'adapte à votre style
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Une expérience entièrement personnalisable pour chaque professionnel
                    </p>
                </div>

                {/* Processus en étapes */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
                    {steps.map((step, index) => (
                        <button
                            key={index}
                            onClick={() => setActiveStep(index)}
                            className={`text-left p-8 rounded-3xl border-2 transition-all duration-500 hover:scale-105 transform ${activeStep === index
                                ? `border-${step.color}-500 bg-${step.color}-50 shadow-xl`
                                : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <div className={`text-4xl mb-6 p-4 rounded-2xl inline-block ${activeStep === index ? `bg-${step.color}-100` : 'bg-gray-100'
                                }`}>
                                {step.icon}
                            </div>
                            <h3 className={`text-2xl font-bold mb-4 ${activeStep === index ? `text-${step.color}-600` : 'text-gray-900'
                                }`}>
                                {step.title}
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                {step.description}
                            </p>

                            {activeStep === index && (
                                <div className="flex items-center mt-6 space-x-2">
                                    <div className={`w-2 h-2 bg-${step.color}-500 rounded-full animate-ping`}></div>
                                    <span className={`text-${step.color}-600 text-sm font-medium`}>Actif</span>
                                </div>
                            )}
                        </button>
                    ))}
                </div>

                {/* Détail de l'étape active */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl border-2 border-gray-200 p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                        <div>
                            <h3 className="text-3xl font-bold text-gray-900 mb-4">
                                {steps[activeStep].title} avec Auriance
                            </h3>
                            <p className="text-gray-600 text-lg leading-relaxed mb-6">
                                {steps[activeStep].description}
                            </p>
                            <ul className="space-y-3">
                                <li className="flex items-center space-x-3">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="text-gray-700">Interface intuitive et fluide</span>
                                </li>
                                <li className="flex items-center space-x-3">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="text-gray-700">Sécurité de niveau professionnel</span>
                                </li>
                                <li className="flex items-center space-x-3">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="text-gray-700">Personnalisation avancée</span>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-white rounded-2xl border-2 border-gray-300 p-6">
                            <div className="text-center mb-4">
                                <div className="text-sm font-medium text-gray-500">PRÉVISUALISATION</div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4 min-h-[200px]">
                                <div className="text-gray-700 text-sm leading-relaxed">
                                    {activeStep === 0 && "Transcription en temps réel de la réunion...\n\nClient: Nous avons besoin de la livraison pour le 15 mars\nManager: Budget approuvé à 85K€\nÉquipe: 3 développeurs et 1 designer assignés\nProchain point: Revu des maquettes semaine prochaine"}
                                    {activeStep === 1 && "Modèle personnalisé - Responsable Projet\n\nStyle: Professionnel et concis\nDomaine: Développement logiciel\nPréférences: Anglais pour termes techniques\nFormats: Rapport court + version détaillée"}
                                    {activeStep === 2 && "Documents générés automatiquement:\n\n✓ Compte-rendu de réunion\n✓ Proposition commerciale\n✓ Plan d'action numérique\n✓ Fiche projet résumée\n\nTout est prêt en 30 secondes."}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}