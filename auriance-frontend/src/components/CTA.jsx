import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Mic, Sparkles, Play } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function CTA() {
    const { t } = useLanguage();

    return (
        <section className="py-32 relative overflow-hidden">
            <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-500/90 to-violet-500" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-300/20 rounded-full blur-3xl" />
            </div>

            <div className="max-w-6xl mx-auto px-6 relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/90 text-sm font-medium mb-8 backdrop-blur-sm">
                        <Sparkles className="w-4 h-4" />
                        {t('cta.badge') || "14 jours d'essai gratuit, sans carte bancaire"}
                    </div>

                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight leading-tight">
                        {t('cta.title') || 'Prêt à transformer vos'}{' '}
                        <span className="text-indigo-200">{t('cta.titleSuffix') || 'processus métier'}</span> ?
                    </h2>

                    <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
                        {t('cta.subtitle') || 'Rejoignez plus de 2,000 experts qui gagnent déjà du temps avec Auriance. Commencez en moins de 2 minutes.'}
                    </p>

                    <div className="flex flex-wrap justify-center gap-4 mb-12">
                        <Link
                            to="/inscription"
                            className="bg-white text-indigo-700 hover:bg-white/90 text-lg px-8 h-14 gap-2 shadow-xl group inline-flex items-center justify-center rounded-xl font-semibold"
                        >
                            <Mic className="w-5 h-5" />
                            {t('cta.btn_start') || 'Commencer gratuitement'}
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                        <Link
                            to="/demo"
                            className="border-2 border-white/30 text-white hover:bg-white/10 text-lg px-8 h-14 gap-2 bg-transparent inline-flex items-center justify-center rounded-xl font-semibold"
                        >
                            <Play className="w-5 h-5" />
                            {t('nav.demo') || 'Voir la démo'}
                        </Link>
                    </div>

                    <div className="flex flex-wrap justify-center items-center gap-8 text-white/60 text-sm">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            {t('cta.feature1') || 'Aucune carte requise'}
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            {t('cta.feature2') || 'Configuration en 2 min'}
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            {t('cta.feature3') || 'Annulez à tout moment'}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
