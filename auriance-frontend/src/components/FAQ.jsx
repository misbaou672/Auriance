import React, { useState } from 'react';
import { ChevronDown, MessageCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function FAQ({ isDark }) {
    const { t } = useLanguage();
    const [openIndex, setOpenIndex] = useState(0);

    const faqs = [
        {
            question: t('faq.q1.question') || 'Quelle est la précision de la transcription ?',
            answer: t('faq.q1.answer') || "Notre moteur de transcription atteint une précision de 92-97% grâce à une IA entrainée sur des contextes multi-sectoriels. Il s'améliore continuellement à l'usage."
        },
        {
            question: t('faq.q2.question') || 'Mes données sont-elles sécurisées ?',
            answer: t('faq.q2.answer') || 'Absolument. Toutes les données sont chiffrées AES-256 et stockées sur des serveurs souverains en Europe. Nous sommes certifiés ISO 27001 et RGPD.'
        },
        {
            question: t('faq.q3.question') || 'Puis-je utiliser Auriance hors ligne ?',
            answer: t('faq.q3.answer') || "La version web nécessite une connexion internet. Cependant, notre application mobile permet une utilisation hors ligne avec synchronisation automatique dès le retour du réseau."
        },
        {
            question: t('faq.q4.question') || "Quels formats d'export sont disponibles ?",
            answer: t('faq.q4.answer') || "Vous pouvez exporter vos comptes-rendus en PDF, Word, JSON ou les envoyer directement vers vos outils (CRM, ERP, Slack) via notre API."
        },
        {
            question: t('faq.q5.question') || "Y a-t-il un engagement minimum ?",
            answer: t('faq.q5.answer') || 'Non, tous nos plans sont sans engagement. Vous pouvez annuler à tout moment et nous offrons une garantie satisfait ou remboursé de 30 jours.'
        },
        {
            question: t('faq.q6.question') || "Comment fonctionne l'essai gratuit ?",
            answer: t('faq.q6.answer') || "L'essai gratuit de 14 jours vous donne accès à toutes les fonctionnalités Pro. Aucune carte bancaire n'est requise pour commencer."
        },
        {
            question: t('faq.q7.question') || 'Auriance est-il compatible avec mes outils ?',
            answer: t('faq.q7.answer') || 'Oui, Auriance propose une API REST complète et des intégrations natives avec les principaux outils du marché (Salesforce, Hubspot, Notion, etc.).'
        },
        {
            question: t('faq.q8.question') || 'Combien de langues sont supportées ?',
            answer: t('faq.q8.answer') || 'Auriance supporte plus de 30 langues avec détection automatique, dont le français, l\'anglais, l\'espagnol, l\'allemand et le mandarin.'
        }
    ];

    const theme = isDark ? {
        tag: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
        textHeading: 'text-white',
        textSub: 'text-slate-400',
        card: (isOpen) => isOpen
            ? 'bg-[#131420] border-indigo-500/30 shadow-lg shadow-indigo-500/5'
            : 'bg-[#131420]/60 border-white/5 hover:border-indigo-500/20',
        question: 'text-slate-200',
        answer: 'text-slate-400',
        chevron: (isOpen) => isOpen ? 'text-indigo-400' : 'text-slate-500',
        iconBtn: 'bg-white/5 text-indigo-300 hover:bg-white/10'
    } : {
        tag: 'bg-indigo-500/10 text-indigo-600',
        textHeading: 'text-gray-900',
        textSub: 'text-gray-500',
        card: (isOpen) => isOpen
            ? 'bg-white border-indigo-500/30 shadow-lg shadow-indigo-500/5'
            : 'bg-white/70 border-gray-200 hover:border-indigo-500/20',
        question: 'text-gray-900',
        answer: 'text-gray-500',
        chevron: (isOpen) => isOpen ? 'text-indigo-600' : 'text-gray-400',
        iconBtn: 'bg-indigo-500/10 text-indigo-700 hover:bg-indigo-500/20'
    };

    return (
        <section id="faq" className={`py-32 relative overflow-hidden transition-colors duration-300`}>
            {/* Background Blob */}
            <div className="absolute inset-0 -z-10 pointer-events-none">
                <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-3xl transition-opacity duration-500 ${isDark ? 'bg-indigo-500/5 opacity-50' : 'bg-indigo-500/5'}`} />
            </div>

            <div className="max-w-6xl mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium mb-4 ${theme.tag}`}>
                        {t('nav.faq')}
                    </span>
                    <h2 className={`text-4xl md:text-5xl font-bold mb-6 tracking-tight ${theme.textHeading}`}>
                        {t('faq.title') || 'Questions'}{' '}
                        <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">{t('faq.titleSuffix') || 'fréquentes'}</span>
                    </h2>
                    <p className={`text-xl ${theme.textSub}`}>
                        {t('faq.subtitle') || 'Tout ce que vous devez savoir sur Auriance. Vous ne trouvez pas la réponse ? Contactez notre équipe.'}
                    </p>
                </div>

                <div className="max-w-3xl mx-auto space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={faq.question}
                            className={`rounded-2xl border transition-all duration-300 ${theme.card(openIndex === index)}`}
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full flex items-center justify-between p-6 text-left"
                            >
                                <span className={`font-semibold pr-4 ${theme.question}`}>{faq.question}</span>
                                <ChevronDown
                                    className={`w-5 h-5 shrink-0 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''} ${theme.chevron(openIndex === index)}`}
                                />
                            </button>
                            <div
                                className={`overflow-hidden transition-all duration-300 ${openIndex === index ? 'max-h-96' : 'max-h-0'}`}
                            >
                                <p className={`px-6 pb-6 leading-relaxed ${theme.answer}`}>
                                    {faq.answer}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <p className={`mb-4 ${theme.textSub}`}>{t('faq.more_questions') || "Vous avez d'autres questions ?"}</p>
                    <a
                        href="#contact"
                        className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${theme.iconBtn}`}
                    >
                        <MessageCircle className="w-5 h-5" />
                        {t('faq.contact_team') || 'Contactez notre équipe'}
                    </a>
                </div>
            </div>
        </section>
    );
}
