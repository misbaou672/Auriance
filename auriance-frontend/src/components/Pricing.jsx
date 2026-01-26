import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Sparkles, Building2, Users } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const cn = (...classes) => classes.filter(Boolean).join(' ');

export default function Pricing({ onNavigateToContact, isDark }) {
    const [isYearly, setIsYearly] = useState(false);
    const { t } = useLanguage();

    const plans = [
        {
            name: t('pricing.free.name') || 'Free',
            description: t('pricing.free.desc') || 'Pour découvrir Auriance',
            price: { monthly: 0, yearly: 0 },
            icon: Sparkles,
            features: (() => {
                const f = t('pricing.free.features');
                return Array.isArray(f) ? f : [
                    '10 transcriptions / mois',
                    'Export PDF basique',
                    'Historique 7 jours',
                    'Support email',
                ];
            })(),
            cta: t('pricing.free.cta') || 'Commencer gratuitement',
            popular: false,
        },
        {
            name: t('pricing.pro.name') || 'Pro',
            description: t('pricing.pro.desc') || 'Pour les experts et indépendants',
            price: { monthly: 29, yearly: 290 },
            icon: Users,
            features: (() => {
                const f = t('pricing.pro.features');
                return Array.isArray(f) ? f : [
                    'Transcriptions illimitées',
                    'Rapports Automatisés IA',
                    'Export PDF personnalisé',
                    'Historique illimité',
                    'API Access',
                    'Support prioritaire',
                ];
            })(),
            cta: t('pricing.pro.cta') || 'Essayer 14 jours gratuit',
            popular: true,
        },
        {
            name: t('pricing.enterprise.name') || 'Entreprise',
            description: t('pricing.enterprise.desc') || 'Pour les équipes et organisations',
            price: { monthly: 99, yearly: 990 },
            icon: Building2,
            features: (() => {
                const f = t('pricing.enterprise.features');
                return Array.isArray(f) ? f : [
                    'Tout Pro inclus',
                    'Multi-utilisateurs',
                    'Dashboard admin',
                    'SSO & SAML',
                    'Intégration CRM/ERP',
                    'Account manager dédié',
                    'SLA 99.9%',
                ];
            })(),
            cta: t('pricing.enterprise.cta') || 'Contacter les ventes',
            popular: false,
        },
    ];

    const theme = isDark ? {
        tag: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
        textHeading: 'text-white',
        textSub: 'text-gray-400',
        toggleText: 'text-gray-400',
        toggleTextActive: 'text-white',
        toggleBg: 'bg-white/10',
        card: 'bg-[#131420] border-white/5 hover:border-indigo-500/30',
        cardTitle: 'text-white',
        cardDesc: 'text-gray-400',
        cardPrice: 'text-white',
        featureIconBg: 'bg-indigo-500/20',
        featureIcon: 'text-indigo-400',
        featureText: 'text-gray-400',
        popularBadge: 'bg-indigo-100 text-indigo-700',
        popularCard: 'bg-gradient-to-br from-indigo-500 to-violet-500 border-none shadow-2xl shadow-indigo-500/20',
        ctaButton: 'bg-indigo-600 hover:bg-indigo-500 text-white'
    } : {
        tag: 'bg-indigo-500/10 text-indigo-600',
        textHeading: 'text-gray-900',
        textSub: 'text-gray-500',
        toggleText: 'text-gray-500',
        toggleTextActive: 'text-gray-900',
        toggleBg: 'bg-indigo-500/20',
        card: 'bg-white border-gray-200 hover:border-indigo-500/30 hover:shadow-xl',
        cardTitle: 'text-gray-900',
        cardDesc: 'text-gray-500',
        cardPrice: 'text-gray-900',
        featureIconBg: 'bg-indigo-500/10',
        featureIcon: 'text-indigo-600',
        featureText: 'text-gray-500',
        popularBadge: 'bg-indigo-100 text-indigo-700',
        popularCard: 'bg-gradient-to-br from-indigo-500 to-violet-500 shadow-2xl shadow-indigo-500/25',
        ctaButton: 'bg-indigo-600 hover:bg-indigo-700 text-white'
    };

    return (
        <section id="pricing" className={`py-32 relative overflow-hidden transition-colors duration-300`}>
            <div className="absolute inset-0 -z-10 pointer-events-none">
                <div className={`absolute top-0 right-1/4 w-96 h-96 rounded-full blur-3xl transition-opacity duration-500 ${isDark ? 'bg-indigo-500/5 opacity-50' : 'bg-indigo-500/10'}`} />
                <div className={`absolute bottom-0 left-1/4 w-80 h-80 rounded-full blur-3xl transition-opacity duration-500 ${isDark ? 'bg-violet-500/5 opacity-50' : 'bg-violet-500/10'}`} />
            </div>

            <div className="max-w-6xl mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium mb-4 ${theme.tag}`}>
                        {t('nav.pricing')}
                    </span>
                    <h2 className={`text-4xl md:text-5xl font-bold mb-6 tracking-tight ${theme.textHeading}`}>
                        {t('pricing.title')} {' '}
                        <span className="gradient-text">{t('pricing.titleSuffix') || 'chaque ambition'}</span>
                    </h2>
                    <p className={`text-xl ${theme.textSub}`}>
                        {t('pricing.subtitle')}
                    </p>
                </div>

                <div className="flex items-center justify-center gap-4 mb-12">
                    <span className={cn('text-sm font-medium', !isYearly ? theme.toggleTextActive : theme.toggleText)}>
                        {t('pricing.monthly') || 'Mensuel'}
                    </span>
                    <button
                        type="button"
                        onClick={() => setIsYearly(!isYearly)}
                        className={`relative w-16 h-8 rounded-full transition-colors ${theme.toggleBg}`}
                        aria-pressed={isYearly}
                    >
                        <span
                            className={cn(
                                'absolute top-1 w-6 h-6 rounded-full bg-indigo-500 transition-all duration-300',
                                isYearly ? 'left-9' : 'left-1'
                            )}
                        />
                    </button>
                    <span className={cn('text-sm font-medium', isYearly ? theme.toggleTextActive : theme.toggleText)}>
                        {t('pricing.yearly') || 'Annuel'}
                        <span className="ml-2 text-xs px-2 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">-17%</span>
                    </span>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={cn(
                                'relative p-8 rounded-3xl transition-all duration-500 hover:-translate-y-2 border',
                                plan.popular
                                    ? theme.popularCard
                                    : theme.card
                            )}
                        >
                            {plan.popular && (
                                <div className={`absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-sm font-medium ${theme.popularBadge}`}>
                                    {t('pricing.popular') || 'Plus populaire'}
                                </div>
                            )}

                            <div
                                className={cn(
                                    'w-14 h-14 rounded-2xl flex items-center justify-center mb-6',
                                    plan.popular ? 'bg-white/20' : theme.featureIconBg
                                )}
                            >
                                <plan.icon className={cn('w-7 h-7', plan.popular ? 'text-white' : theme.featureIcon)} />
                            </div>

                            <h3 className={cn("text-2xl font-bold mb-2", plan.popular ? 'text-white' : theme.cardTitle)}>{plan.name}</h3>
                            <p className={cn('text-sm mb-6', plan.popular ? 'text-white/80' : theme.cardDesc)}>
                                {plan.description}
                            </p>

                            <div className="mb-8">
                                <span className={cn("text-5xl font-bold", plan.popular ? 'text-white' : theme.cardPrice)}>
                                    {plan.price.monthly === 0 ? (t('pricing.free_price') || 'Gratuit') : `${isYearly ? plan.price.yearly : plan.price.monthly}€`}
                                </span>
                                {plan.price.monthly > 0 && (
                                    <span className={cn('text-sm ml-2', plan.popular ? 'text-white/80' : theme.cardDesc)}>
                                        /{isYearly ? (t('pricing.year') || 'an') : (t('pricing.month') || 'mois')}
                                    </span>
                                )}
                            </div>

                            <ul className="space-y-4 mb-8">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-center gap-3">
                                        <div
                                            className={cn(
                                                'w-5 h-5 rounded-full flex items-center justify-center',
                                                plan.popular ? 'bg-white/20' : theme.featureIconBg
                                            )}
                                        >
                                            <Check className={cn('w-3 h-3', plan.popular ? 'text-white' : theme.featureIcon)} />
                                        </div>
                                        <span className={cn('text-sm', plan.popular ? 'text-white/90' : theme.featureText)}>
                                            {feature}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            {plan.name === 'Entreprise' ? (
                                <button
                                    type="button"
                                    onClick={onNavigateToContact}
                                    className={cn(
                                        'w-full h-12 text-base font-medium rounded-xl',
                                        plan.popular
                                            ? 'bg-white text-indigo-600 hover:bg-white/90'
                                            : theme.ctaButton
                                    )}
                                >
                                    {plan.cta}
                                </button>
                            ) : (
                                <Link
                                    to="/inscription"
                                    className={cn(
                                        'w-full h-12 text-base font-medium rounded-xl inline-flex items-center justify-center',
                                        plan.popular
                                            ? 'bg-white text-indigo-600 hover:bg-white/90'
                                            : theme.ctaButton
                                    )}
                                >
                                    {plan.cta}
                                </Link>
                            )}
                        </div>
                    ))}
                </div>

                <p className={`text-center text-sm mt-12 ${theme.textSub}`}>
                    {t('pricing.footer') || 'Tous les prix sont HT. Annulez à tout moment. Satisfait ou remboursé 30 jours.'}
                </p>
            </div>
        </section>
    );
}
