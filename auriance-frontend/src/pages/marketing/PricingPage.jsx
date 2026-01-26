import React from 'react';
import { motion } from 'framer-motion';

const PricingPage = ({ onNavigateToContact }) => {
    const plans = [
        {
            title: "DÉVELOPPEUR",
            price: "0€",
            period: "/mois",
            description: "Pour explorer et prototyper",
            features: [
                "100 transcriptions / mois",
                "1 base de données connectée",
                "Support communautaire",
                "API rate-limited"
            ],
            buttonText: "Commencer gratuitement",
            highlight: false
        },
        {
            title: "STARTUP",
            price: "199€",
            period: "/mois",
            description: "Pour les produits en croissance",
            features: [
                "10 000 transcriptions / mois",
                "3 bases de données",
                "Support prioritaire (email)",
                "SDK Frontend personnalisé",
                "SLA 99.9%"
            ],
            buttonText: "Essayer maintenant",
            highlight: true
        },
        {
            title: "ENTREPRISE",
            price: "Sur mesure",
            period: "",
            description: "Pour les besoins critiques",
            features: [
                "Transcriptions illimitées",
                "Bases de données illimitées",
                "Support dédié 24/7",
                "Déploiement On-Premise / HDS",
                "Formation & Onboarding"
            ],
            buttonText: "Contacter les ventes",
            action: onNavigateToContact,
            highlight: false
        }
    ];

    return (
        <div className="pt-24 pb-16 bg-gradient-to-br from-slate-50 to-blue-50">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                        Des tarifs simples pour scalables
                    </h1>
                    <p className="text-xl text-slate-600">
                        Commencez gratuitement, payez en grandissant. Pas de carte de crédit requise.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {plans.map((plan, index) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            key={index}
                            className={`relative bg-white rounded-2xl p-8 ${plan.highlight
                                    ? 'ring-2 ring-blue-500 shadow-xl scale-105 z-10'
                                    : 'border border-slate-200 shadow-sm'
                                }`}
                        >
                            {plan.highlight && (
                                <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                                    POPULAIRE
                                </span>
                            )}
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">{plan.title}</h3>
                            <div className="flex items-baseline mb-4">
                                <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                                <span className="text-slate-500 ml-1">{plan.period}</span>
                            </div>
                            <p className="text-slate-600 mb-6">{plan.description}</p>

                            <ul className="space-y-4 mb-8">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-center text-slate-600">
                                        <svg className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={plan.action || (() => { })}
                                className={`w-full py-3 px-6 rounded-xl font-semibold transition-all ${plan.highlight
                                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:scale-[1.02]'
                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                    }`}
                            >
                                {plan.buttonText}
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PricingPage;
