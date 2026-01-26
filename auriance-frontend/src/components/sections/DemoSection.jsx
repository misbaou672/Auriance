// src/components/sections/DemoSection.jsx
import React, { useState, useEffect } from 'react';
import { useNavigation } from '../../contexts/NavigationContext';

export default function DemoSection() {
    const [activeDemo, setActiveDemo] = useState('transcription');
    const [isRecording, setIsRecording] = useState(false);
    const { navigateTo } = useNavigation();

    useEffect(() => {
        const interval = setInterval(() => {
            setIsRecording(prev => !prev);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const demos = {
        transcription: {
            title: "Transcription en temps réel",
            content: "Patient de 45 ans, consultation pour douleurs thoraciques évoluant depuis 3 jours. Pas d'antécédents cardiaques. Examen clinique normal. ECG réalisé : rythme sinusal régulier. Pas de signes d'ischémie.",
            type: "Cardiologie",
            tags: ["Urgence", "ECG normal", "Suivi programmé"]
        },
        courrier: {
            title: "Lettre d'adressage",
            content: "Cher Confrère,\n\nJe vous adresse Monsieur Martin pour avis cardiologique concernant des douleurs thoraciques atypiques. Bilan initial normal incluant ECG. Persistance des symptômes nécessitant votre expertise.\n\nCordialement,",
            type: "Correspondance",
            tags: ["Adressage", "Cardiologie", "Courrier professionnel"]
        },
        formulaire: {
            title: "Compte rendu consultation",
            content: "MOTIF: Douleurs thoraciques\nEXAMEN: Clinique normal, ECG sinusal\nDIAGNOSTIC: Douleurs musculo-squelettiques\nTRAITEMENT: Antalgiques niveau I\nSUIVI: Consultation sous 8 jours si persistance",
            type: "CR Médical",
            tags: ["Urgence", "Traitement", "Suivi"]
        }
    };

    return (
        <section className="min-h-screen bg-gradient-to-br from-white to-gray-50 py-20 relative">
            <div className="max-w-6xl mx-auto px-6">

                {/* En-tête */}
                <div className="text-center mb-16">
                    <button
                        onClick={() => navigateTo('hero', 'prev')}
                        className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium mb-8 transition-all duration-300 hover:scale-105"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Retour à l'accueil
                    </button>

                    <h2 className="text-5xl font-bold text-gray-900 mb-6">
                        Découvrez Auriance en action
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Interface clinique intuitive conçue pour les professionnels de santé
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

                    {/* Navigation des fonctionnalités */}
                    <div className="space-y-6">
                        {Object.entries(demos).map(([key, demo]) => (
                            <button
                                key={key}
                                onClick={() => setActiveDemo(key)}
                                className={`w-full text-left p-6 rounded-2xl border-2 transition-all duration-500 hover:scale-105 transform ${activeDemo === key
                                    ? 'border-blue-500 bg-blue-50 shadow-xl'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className="flex items-start space-x-4">
                                    <div className={`p-3 rounded-xl transition-all duration-300 ${activeDemo === key ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        {key === 'transcription' && '🎙️'}
                                        {key === 'courrier' && '📝'}
                                        {key === 'formulaire' && '📋'}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className={`text-xl font-semibold mb-2 transition-all duration-300 ${activeDemo === key ? 'text-blue-600' : 'text-gray-900'
                                            }`}>
                                            {demo.title}
                                        </h3>
                                        <p className="text-gray-600 text-sm leading-relaxed">
                                            {demo.content.split('\n')[0]}...
                                        </p>
                                    </div>
                                    {activeDemo === key && (
                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
                                    )}
                                </div>
                            </button>
                        ))}

                        {/* Call to action */}
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border-2 border-blue-200 p-6 mt-8">
                            <h4 className="font-semibold text-gray-900 mb-2">Prêt à essayer ?</h4>
                            <p className="text-gray-600 text-sm mb-4">Testez Auriance gratuitement pendant 14 jours</p>
                            <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-300 hover:scale-105 transform">
                                Commencer l'essai gratuit
                            </button>
                        </div>
                    </div>

                    {/* Interface de démonstration */}
                    <div className="sticky top-24">
                        <div className="bg-white rounded-3xl border-2 border-gray-200 shadow-2xl overflow-hidden transform hover:scale-105 transition-all duration-500">

                            {/* Header de l'interface */}
                            <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        <span className="text-sm font-medium text-gray-700 ml-2">Auriance Clinique</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {isRecording && (
                                            <div className="flex items-center space-x-1 px-2 py-1 bg-red-50 border border-red-200 rounded-full">
                                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                                <span className="text-red-700 text-xs font-medium">ENREGISTREMENT</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Contenu de la démo */}
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-gray-900">{demos[activeDemo].title}</h3>
                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full font-medium">
                                        {demos[activeDemo].type}
                                    </span>
                                </div>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {demos[activeDemo].tags.map((tag, index) => (
                                        <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full font-medium">
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                {/* Zone de texte */}
                                <div className="bg-gray-50 rounded-2xl border-2 border-gray-300 p-6 min-h-[300px] mb-6">
                                    <div className="text-gray-700 leading-relaxed whitespace-pre-line text-sm">
                                        {demos[activeDemo].content}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="grid grid-cols-2 gap-3">
                                    <button className="bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-300 hover:scale-105 transform text-sm">
                                        Générer le document
                                    </button>
                                    <button className="border-2 border-gray-300 text-gray-700 py-4 rounded-xl font-semibold hover:border-gray-400 transition-all duration-300 hover:scale-105 transform text-sm">
                                        Personnaliser
                                    </button>
                                </div>

                                {/* Indicateur de statut */}
                                <div className="flex items-center justify-center mt-6 space-x-4 text-sm text-gray-500">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span>Connecté</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                        <span>En traitement</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}