// src/components/sections/HeroSection.jsx
import React from 'react';
import { useNavigation } from '../../contexts/NavigationContext';

export default function HeroSection() {
    const { navigateTo } = useNavigation();

    return (
        <section className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-white pt-20 relative overflow-hidden">

            {/* Background Animations */}
            <div className="absolute inset-0">
                <div className="absolute top-20 left-10 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"></div>
                <div className="absolute top-40 right-10 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: '2s' }}></div>
                <div className="absolute bottom-20 left-1/3 w-96 h-96 bg-cyan-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: '4s' }}></div>
            </div>

            <div className="relative max-w-7xl mx-auto px-6 pt-32 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                    {/* Contenu Principal */}
                    <div className="space-y-8">
                        {/* Badge */}
                        <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 border border-blue-200">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping mr-2"></div>
                            <span className="text-blue-700 text-sm font-medium">Solution médicale certifiée</span>
                        </div>

                        {/* Titre */}
                        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                            L'assistant qui simplifie la vie des{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                                soignants
                            </span>
                        </h1>

                        <p className="text-2xl text-gray-600 font-light">
                            Du temps pour ce qui compte vraiment.
                        </p>

                        <p className="text-xl text-gray-500 leading-relaxed">
                            Vos notes, comptes rendus et documents médicaux rédigés pour vous en un instant.
                        </p>

                        {/* Boutons CTA */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <button
                                onClick={() => navigateTo('demo', 'next')}
                                className="group bg-gray-900 text-white px-8 py-4 rounded-2xl font-semibold hover:bg-gray-800 transition-all duration-500 hover:shadow-2xl hover:scale-105 transform text-lg"
                            >
                                <span className="flex items-center space-x-2">
                                    <span>Voir la démo</span>
                                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </span>
                            </button>
                            <button className="group border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-2xl font-semibold hover:border-gray-400 hover:bg-white transition-all duration-500 hover:shadow-lg hover:scale-105 transform text-lg">
                                <span className="flex items-center space-x-2">
                                    <span>Essayer gratuitement</span>
                                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </span>
                            </button>
                        </div>

                        {/* Navigation Rapide */}
                        <div className="flex flex-wrap gap-4 pt-8">
                            <button
                                onClick={() => navigateTo('workflow', 'next')}
                                className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-all duration-300 hover:scale-105"
                            >
                                → Voir le fonctionnement
                            </button>
                            <button
                                onClick={() => navigateTo('usecases', 'next')}
                                className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-all duration-300 hover:scale-105"
                            >
                                → Cas d'usage par spécialité
                            </button>
                            <button
                                onClick={() => navigateTo('security', 'next')}
                                className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-all duration-300 hover:scale-105"
                            >
                                → Sécurité et conformité
                            </button>
                        </div>
                    </div>

                    {/* Illustration/Preview */}
                    <div className="relative">
                        <div className="bg-white rounded-3xl border-2 border-gray-200 shadow-2xl p-8 transform hover:scale-105 transition-all duration-500">
                            <div className="flex items-center space-x-2 mb-6">
                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <div className="flex-1 text-center text-sm font-medium text-gray-600">Auriance - Interface Clinique</div>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-blue-50 rounded-2xl p-4 border-2 border-blue-200">
                                    <div className="text-sm text-blue-700 font-medium">Transcription en direct</div>
                                    <div className="text-gray-600 text-sm mt-2">Consultation en cours...</div>
                                </div>

                                <div className="bg-gray-50 rounded-2xl p-4 border-2 border-gray-200">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                        <div className="text-sm text-gray-600 font-medium">Note clinique générée</div>
                                    </div>
                                    <div className="text-xs text-gray-500">Patient: Douleurs abdominales - Examen: Abdomen sensible - Diagnostic: En cours</div>
                                </div>
                            </div>

                            <div className="flex space-x-3 mt-6">
                                <button className="flex-1 bg-blue-600 text-white py-3 rounded-xl text-sm font-medium hover:bg-blue-700 transition-all duration-300">
                                    Générer
                                </button>
                                <button className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-xl text-sm font-medium hover:border-gray-400 transition-all duration-300">
                                    Modifier
                                </button>
                            </div>
                        </div>

                        {/* Élément flottant */}
                        <div className="absolute -top-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg animate-bounce">
                            En direct ✓
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation vers le bas */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                <button
                    onClick={() => navigateTo('stats', 'next')}
                    className="animate-bounce text-gray-400 hover:text-gray-600 transition-colors duration-300"
                >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                </button>
            </div>
        </section>
    );
}