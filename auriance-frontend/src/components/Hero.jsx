import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, ArrowRight, Mic, FileText, Zap, Shield, Star, Heart } from 'lucide-react';
import InscriptionModal from './InscriptionModal';
import { VoiceWaveBackground } from './VoiceWave';
import { useLanguage } from '../contexts/LanguageContext';

const stats = [
    { value: '92%', label: 'Précision' },
    { value: '45%', label: 'Temps gagné' },
    { value: '10k+', label: 'Consultations' },
];

export default function Hero({ onNavigateToDemo, isDark }) {
    const { t } = useLanguage();
    const [displayText, setDisplayText] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const fullText = "Lors de la réunion de ce matin, nous avons validé le lancement du projet Alpha pour le T4. Les objectifs principaux sont d'augmenter la productivité de 45%...";

    // ... (UseEffects inchangés)

    return (
        <section className={`relative min-h-screen flex items-center justify-center overflow-hidden pt-20 ${isDark ? '' : ''}`}>
            {/* ... (Backgrounds inchangés) */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-20 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-orb" />
                <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-violet-500/20 rounded-full blur-3xl animate-orb" style={{ animationDelay: '2s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-400/15 rounded-full blur-3xl animate-orb" style={{ animationDelay: '1s' }} />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.04)_1px,transparent_1px)] bg-[size:60px_60px]" />
                <div className="absolute bottom-0 left-0 right-0 h-64">
                    <VoiceWaveBackground />
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-20">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8">
                        <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium ${isDark ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20' : 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20'}`}>
                                <Zap className="w-4 h-4" />
                                {t('home.hero.newFeatureBadge')}
                            </div>
                        </div>

                        <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                            <h1 className={`text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                <span className="block">{t('home.hero.title')}</span>
                                <span className="block gradient-text">{t('home.hero.titleSuffix')}</span>
                                {/* <span className="block">productivité</span> */}
                            </h1>
                            <p className={`text-xl max-w-lg leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                {t('home.hero.subtitle')}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:opacity-90 transition-all shadow-xl shadow-indigo-500/25 text-lg px-8 h-14 gap-2 group rounded-xl text-white font-semibold inline-flex items-center"
                            >
                                <Mic className="w-5 h-5" />
                                {t('home.hero.cta_demo') || 'Essayer gratuitement'}
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </button>
                            <Link
                                to="/demo"
                                onClick={(event) => {
                                    if (onNavigateToDemo) {
                                        event.preventDefault();
                                        onNavigateToDemo();
                                    }
                                }}
                                className={`text-lg px-8 h-14 gap-2 border-2 rounded-xl font-semibold inline-flex items-center transition-colors ${isDark ? 'border-gray-600 text-white hover:bg-white/5' : 'border-gray-200 hover:bg-gray-50 text-gray-800'}`}
                            >
                                <Play className="w-5 h-5" />
                                {t('home.hero.watchDemo')}
                            </Link>
                        </div>

                        <div className="flex gap-8 pt-4 animate-slide-up" style={{ animationDelay: '0.4s' }}>
                            {[
                                { value: '98%', label: t('home.hero.statPrecision') },
                                { value: '2h/j', label: t('home.hero.statTimeFreed') },
                                { value: '10k+', label: t('home.hero.statUsers') },
                            ].map((stat) => (
                                <div key={stat.label} className="text-center">
                                    <div className="text-3xl font-bold gradient-text">{stat.value}</div>
                                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{stat.label}</div>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center gap-4 pt-2 animate-slide-up" style={{ animationDelay: '0.5s' }}>
                            <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-indigo-400 text-indigo-400" />
                                ))}
                            </div>
                            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('home.hero.adoptedBy')}</span>
                        </div>
                    </div>

                    <div className="relative animate-scale-in" style={{ animationDelay: '0.3s' }}>
                        <div className={`relative rounded-3xl p-8 shadow-2xl ${isDark ? 'glass shadow-indigo-500/20' : 'glass shadow-indigo-500/10'}`}>
                            <div className="flex justify-center mb-8">
                                <div className="relative">
                                    {isRecording && (
                                        <>
                                            <div className="absolute inset-0 rounded-full bg-indigo-500/20 animate-wave" />
                                            <div className="absolute inset-0 rounded-full bg-indigo-500/20 animate-wave" style={{ animationDelay: '0.5s' }} />
                                            <div className="absolute inset-0 rounded-full bg-indigo-500/20 animate-wave" style={{ animationDelay: '1s' }} />
                                        </>
                                    )}
                                    <div className={`relative z-10 w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center transition-all duration-300 ${isRecording ? 'animate-pulse-glow scale-110' : ''}`}>
                                        <Mic className={`w-10 h-10 text-white transition-transform ${isRecording ? 'scale-110' : ''}`} />
                                    </div>
                                </div>
                            </div>

                            <div className="text-center mb-6">
                                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${isRecording ? 'bg-indigo-500/10 text-indigo-600' : 'bg-gray-100 text-gray-500'}`}>
                                    <span className={`w-2 h-2 rounded-full ${isRecording ? 'bg-indigo-500 animate-pulse' : 'bg-gray-400'}`} />
                                    {isRecording ? t('home.hero.voiceAnalysis') : t('home.hero.readyToTranscribe')}
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-2xl p-6 min-h-[120px] mb-6">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                                        <FileText className="w-4 h-4 text-indigo-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-500 mb-1">{t('home.hero.realtimeTranscription')}</p>
                                        <p className="text-gray-900 leading-relaxed min-h-[60px]">
                                            {displayText}
                                            {isRecording && <span className="inline-block w-0.5 h-5 bg-indigo-500 animate-pulse ml-0.5" />}
                                        </p>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Floating Cards - Badges Sécurisées etc */}
                        <div className={`absolute -top-4 -right-4 p-4 rounded-2xl shadow-lg animate-float border ${isDark ? 'glass border-white/10' : 'glass border-indigo-200/50'}`}>
                            <div className="flex items-center gap-2">
                                <Shield className="w-5 h-5 text-indigo-500" />
                                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('home.hero.badgeSecure')}</span>
                            </div>
                        </div>

                        <div className={`absolute -bottom-4 -left-4 p-4 rounded-2xl shadow-lg animate-float border ${isDark ? 'glass border-white/10' : 'glass border-violet-200/50'}`} style={{ animationDelay: '1s' }}>
                            <div className="flex items-center gap-2">
                                <Zap className="w-5 h-5 text-indigo-500" />
                                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('home.hero.badgeAI')}</span>
                            </div>
                        </div>

                        <div className={`absolute top-1/2 -right-8 p-3 rounded-xl shadow-lg animate-float ${isDark ? 'glass border border-white/10' : 'glass'}`} style={{ animationDelay: '2s' }}>
                            <div className="flex items-center gap-2">
                                <Zap className="w-4 h-4 text-violet-500" />
                                <span className={`text-xs font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('home.hero.badgeRealtime')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>



            <InscriptionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </section>
    );
}