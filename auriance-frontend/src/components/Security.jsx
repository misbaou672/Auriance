import React from 'react';
import { Shield, Lock, Server, FileCheck, Eye, Database } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Security({ isDark }) {
    const { t } = useLanguage();

    const securityFeatures = [
        {
            icon: Lock,
            title: t('security.f1.title') || 'Chiffrement AES-256',
            description: t('security.f1.desc') || 'Toutes vos données sont chiffrées au repos et en transit avec les standards militaires.',
        },
        {
            icon: Server,
            title: t('security.f2.title') || 'Hébergement Souverain',
            description: t('security.f2.desc') || 'Vos données restent en France/Europe avec certification SecNumCloud.',
        },
        {
            icon: FileCheck,
            title: t('security.f3.title') || 'Conforme RGPD',
            description: t('security.f3.desc') || 'Respect total du Règlement Général sur la Protection des Données.',
        },
        {
            icon: Eye,
            title: t('security.f4.title') || 'Confidentialité Totale',
            description: t('security.f4.desc') || 'Nous n\'avons jamais accès à vos contenus en clair.',
        },
        {
            icon: Database,
            title: t('security.f5.title') || 'Backup temps réel',
            description: t('security.f5.desc') || 'Sauvegardes automatiques chiffrées et géoredondantes.',
        },
        {
            icon: Shield,
            title: t('security.f6.title') || 'Audit de sécurité',
            description: t('security.f6.desc') || 'Tests de pénétration et audits réguliers par des experts indépendants.',
        },
    ];

    const certifications = [
        { name: 'ISO 27001', description: t('security.certs.iso') || "Sécurité de l'information" },
        { name: 'SecNum', description: t('security.certs.secnum') || 'Cloud Souverain' },
        { name: 'RGPD', description: t('security.certs.rgpd') || 'Protection des données' },
        { name: 'SOC 2', description: t('security.certs.soc2') || 'Contrôles de sécurité' },
    ];

    const theme = isDark ? {
        bg: 'bg-transparent',
        textHeading: 'text-white',
        textSub: 'text-gray-400',
        textCardTitle: 'text-white',
        tag: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
        glassCard: 'bg-[#131420]/80 border border-indigo-500/20 shadow-xl shadow-indigo-500/5',
        certCard: 'bg-white/5 border border-white/5',
        certText: 'text-indigo-300',
        certDesc: 'text-gray-400',
        featureHover: 'hover:bg-white/5',
        iconBg: 'bg-indigo-500/20',
        icon: 'text-indigo-400',
        floatingIconBg: 'bg-[#131420] border border-white/10',
        ctaBox: 'bg-gradient-to-r from-indigo-900/40 via-violet-900/20 to-indigo-900/40 border border-indigo-500/20',
        ctaButton: 'bg-indigo-600 hover:bg-indigo-500 text-white',
        shieldBg: 'bg-[#131420] border-indigo-500/30'
    } : {
        bg: 'bg-gradient-to-b from-white via-indigo-500/5 to-white',
        textHeading: 'text-gray-900',
        textSub: 'text-gray-500',
        textCardTitle: 'text-gray-900',
        tag: 'bg-indigo-500/10 text-indigo-600',
        glassCard: 'bg-white/70 backdrop-blur-md border border-white/50 shadow-2xl',
        certCard: 'bg-gray-50/80',
        certText: 'text-indigo-600',
        certDesc: 'text-gray-500',
        featureHover: 'hover:bg-gray-50',
        iconBg: 'bg-indigo-500/10',
        icon: 'text-indigo-600',
        floatingIconBg: 'bg-white/80 backdrop-blur border border-white/50',
        ctaBox: 'bg-gradient-to-r from-indigo-500/10 via-violet-500/5 to-indigo-500/10 border border-indigo-500/20',
        ctaButton: 'bg-indigo-600 hover:bg-indigo-700 text-white',
        shieldBg: 'bg-white border-indigo-500/30'
    };

    return (
        <section id="security" className={`py-32 relative overflow-hidden transition-colors duration-300 ${!isDark ? 'bg-white' : ''}`}>
            {!isDark && <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white via-indigo-500/5 to-white" />}

            <div className="max-w-6xl mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium mb-4 ${theme.tag}`}>
                        {t('security.badge') || 'Sécurité & Conformité'}
                    </span>
                    <h2 className={`text-4xl md:text-5xl font-bold mb-6 tracking-tight ${theme.textHeading}`}>
                        {t('security.title') || 'Vos données sont'}{' '}
                        <span className="gradient-text">{t('security.titleSuffix') || 'notre priorité'}</span>
                    </h2>
                    <p className={`text-xl leading-relaxed ${theme.textSub}`}>
                        {t('security.subtitle') || "Auriance a été conçu dès le départ avec la sécurité au cœur de son architecture. Nous dépassons les standards de l'industrie pour protéger vos informations."}
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
                    <div className="relative">
                        <div className={`relative z-10 rounded-3xl p-8 ${theme.glassCard}`}>
                            <div className="flex justify-center mb-8">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
                                    <div className="relative w-40 h-40 rounded-full bg-gradient-to-br from-indigo-500/20 to-violet-500/5 flex items-center justify-center">
                                        <div className={`w-28 h-28 rounded-full border-4 flex items-center justify-center ${theme.shieldBg}`}>
                                            <Shield className="w-14 h-14 text-indigo-500" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {certifications.map((cert) => (
                                    <div key={cert.name} className={`p-4 rounded-2xl text-center transition-colors ${theme.certCard}`}>
                                        <div className={`text-lg font-bold mb-1 ${theme.certText}`}>{cert.name}</div>
                                        <div className={`text-xs ${theme.certDesc}`}>{cert.description}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className={`absolute -top-4 -right-4 p-4 rounded-2xl shadow-lg animate-float ${theme.floatingIconBg}`}>
                            <Lock className="w-6 h-6 text-indigo-500" />
                        </div>
                        <div
                            className={`absolute -bottom-4 -left-4 p-4 rounded-2xl shadow-lg animate-float ${theme.floatingIconBg}`}
                            style={{ animationDelay: '1s' }}
                        >
                            <FileCheck className="w-6 h-6 text-indigo-500" />
                        </div>
                    </div>

                    <div className="grid gap-6">
                        {securityFeatures.map((feature) => (
                            <div
                                key={feature.title}
                                className={`group flex gap-4 p-4 rounded-2xl transition-all duration-300 ${theme.featureHover}`}
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform ${theme.iconBg}`}>
                                    <feature.icon className={`w-6 h-6 ${theme.icon}`} />
                                </div>
                                <div>
                                    <h3 className={`font-semibold mb-1 ${theme.textCardTitle}`}>{feature.title}</h3>
                                    <p className={`text-sm ${theme.textSub}`}>{feature.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={`relative overflow-hidden rounded-3xl p-8 md:p-12 ${theme.ctaBox}`}>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <h3 className={`text-2xl font-bold mb-2 ${theme.textHeading}`}>{t('security.cta.title') || "Besoin d'une attestation de conformité ?"}</h3>
                            <p className={theme.textSub}>
                                {t('security.cta.text') || "Notre équipe peut vous fournir tous les documents nécessaires pour vos audits."}
                            </p>
                        </div>
                        <a
                            href="#contact"
                            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors shrink-0 ${theme.ctaButton}`}
                        >
                            <FileCheck className="w-5 h-5" />
                            {t('security.cta.btn') || "Demander les documents"}
                        </a>
                    </div>

                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
                </div>
            </div>
        </section>
    );
}
