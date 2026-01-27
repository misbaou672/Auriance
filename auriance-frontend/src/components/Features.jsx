import React, { useRef } from 'react';
import { Mic, FileText, Download, History, Brain, Shield, Zap, Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Features({ isDark }) {
    const { t } = useLanguage();
    const containerRef = useRef(null);

    // Dynamic features list based on translation
    const features = [
        {
            icon: Mic,
            title: t('home.features.f1_title'),
            description: t('home.features.f1_desc'),
            gradient: 'from-indigo-500 to-indigo-500/50',
            delay: '0s',
        },
        {
            icon: Brain,
            title: t('home.features.f2_title'),
            description: t('home.features.f2_desc'),
            gradient: 'from-violet-500 to-violet-500/50',
            delay: '0.1s',
        },
        {
            icon: FileText,
            title: t('home.features.f4_title'),
            description: t('home.features.f4_desc'),
            gradient: 'from-blue-500 to-blue-500/50',
            delay: '0.2s',
        },
        {
            icon: Download,
            title: t('home.features.f5_title'),
            description: t('home.features.f5_desc'),
            gradient: 'from-indigo-600 to-indigo-600/50',
            delay: '0.3s',
        },
        {
            icon: History,
            title: t('home.features.f6_title'),
            description: t('home.features.f6_desc'),
            gradient: 'from-sky-500 to-sky-500/50',
            delay: '0.4s',
        },
        {
            icon: Shield,
            title: t('home.features.f3_title'),
            description: t('home.features.f3_desc'),
            gradient: 'from-violet-600 to-violet-600/50',
            delay: '0.5s',
        },
    ];

    const howItWorks = [
        {
            step: '01',
            title: t('home.features.step1Title'),
            description: t('home.features.step1Desc'),
            icon: Mic,
        },
        {
            step: '02',
            title: t('home.features.step2Title'),
            description: t('home.features.step2Desc'),
            icon: Brain,
        },
        {
            step: '03',
            title: t('home.features.step3Title'),
            description: t('home.features.step3Desc'),
            icon: Download,
        },
    ];

    const theme = isDark ? {
        bg: 'bg-transparent', // Le parent gère le fond
        textHeading: 'text-white',
        textBody: 'text-indigo-200/70',
        card: 'bg-[#131420]/80 border-indigo-500/20 hover:shadow-indigo-500/10 hover:border-indigo-500/40',
        cardTitle: 'text-white',
        cardText: 'text-indigo-200/60',
        tag: 'bg-indigo-500/10 text-indigo-400',
        stepLine: 'from-indigo-500/50',
        stepCircle: 'bg-[#131420] border-indigo-500/30',
        stepNumber: 'bg-gradient-to-br from-indigo-500 to-violet-500 text-white',
        statBox: 'bg-[#131420]/50 border-indigo-500/20',
        iconBox: 'bg-indigo-500/20 text-indigo-400',
        gradientText: 'bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-400'
    } : {
        bg: 'bg-white',
        textHeading: 'text-slate-900',
        textBody: 'text-gray-500',
        card: 'bg-white border-gray-200 hover:border-indigo-500/30 hover:shadow-indigo-500/5',
        cardTitle: 'text-gray-900',
        cardText: 'text-gray-500',
        tag: 'bg-indigo-500/10 text-indigo-600',
        stepLine: 'from-indigo-500/50',
        stepCircle: 'bg-white border-indigo-500/20',
        stepNumber: 'bg-gradient-to-br from-indigo-500 to-violet-500 text-white',
        statBox: 'bg-gradient-to-br from-indigo-500/5 to-violet-500/5 border-indigo-500/10',
        iconBox: 'bg-indigo-500/10 text-indigo-600',
        gradientText: 'bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600'
    };

    return (
        <section id="features" className={`py-32 relative overflow-hidden transition-colors duration-300 ${isDark ? '' : 'bg-white'}`}>
            <div className="absolute inset-0 -z-10 pointer-events-none">
                <div className={`absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[100px] transition-colors duration-500 ${isDark ? 'bg-indigo-900/20' : 'bg-indigo-500/15'}`} />
                <div className={`absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full blur-[120px] transition-colors duration-500 ${isDark ? 'bg-violet-900/20' : 'bg-violet-500/15'}`} />
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[120px] transition-colors duration-500 ${isDark ? 'bg-purple-900/10' : 'bg-purple-500/10'}`} />
            </div>

            <div className="max-w-6xl mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium mb-4 ${theme.tag}`}>
                        {t('home.features.sectionTitle')}
                    </span>
                    <h2 className={`text-4xl md:text-5xl font-bold mb-6 tracking-tight ${theme.textHeading}`}>
                        {t('home.features.mainTitle')}{' '}
                        <span className={theme.gradientText}>{t('home.features.mainTitleSuffix')}</span>
                    </h2>
                    <p className={`text-xl leading-relaxed ${theme.textBody}`}>
                        {t('home.features.mainSubtitle')}
                    </p>
                </div>

                <div ref={containerRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-32">
                    {features.map((feature) => (
                        <div
                            key={feature.title}
                            className={`group relative p-8 rounded-3xl border transition-all duration-500 hover:shadow-xl hover:-translate-y-1 ${theme.card}`}
                            style={{ animationDelay: feature.delay }}
                        >
                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                                <feature.icon className="w-7 h-7 text-white" />
                            </div>

                            <h3 className={`text-xl font-semibold mb-3 ${theme.cardTitle}`}>{feature.title}</h3>
                            <p className={`leading-relaxed ${theme.cardText}`}>{feature.description}</p>

                            <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity -z-10`} />
                        </div>
                    ))}
                </div>

                <div className="relative">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium mb-4 ${theme.tag}`}>
                            {t('home.features.howItWorksTag')}
                        </span>
                        <h2 className={`text-4xl md:text-5xl font-bold tracking-tight ${theme.textHeading}`}>
                            {t('home.features.howItWorksTitle')}{' '}
                            <span className={theme.gradientText}>{t('home.features.howItWorksTitleSuffix')}</span>
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {howItWorks.map((step, index) => (
                            <div key={step.step} className="relative">
                                {index < howItWorks.length - 1 && (
                                    <div className={`hidden md:block absolute top-16 left-[60%] w-[80%] h-0.5 bg-gradient-to-r ${theme.stepLine} to-transparent`} />
                                )}

                                <div className="relative z-10 text-center p-8">
                                    <div className="relative inline-flex mb-6">
                                        <div className={`w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500/10 to-violet-500/10 flex items-center justify-center`}>
                                            <div className={`w-24 h-24 rounded-full border-2 flex items-center justify-center ${theme.stepCircle}`}>
                                                <step.icon className={`w-10 h-10 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
                                            </div>
                                        </div>
                                        <span className={`absolute -top-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${theme.stepNumber}`}>
                                            {step.step}
                                        </span>
                                    </div>

                                    <h3 className={`text-2xl font-bold mb-3 ${theme.textHeading}`}>{step.title}</h3>
                                    <p className={theme.textBody}>{step.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={`mt-32 grid md:grid-cols-4 gap-8 p-8 rounded-3xl border ${theme.statBox}`}>
                    {[
                        { icon: Zap, value: '< 100ms', label: t('home.features.statLatency') },
                        { icon: Globe, value: '30+', label: t('home.features.statLanguages') },
                        { icon: Shield, value: '100%', label: t('home.features.statEncrypted') },
                        { icon: History, value: '∞', label: t('home.features.statHistory') },
                    ].map((stat) => (
                        <div key={stat.label} className="text-center">
                            <div className={`inline-flex w-12 h-12 rounded-xl items-center justify-center mb-4 ${theme.iconBox}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div className={`text-3xl font-bold mb-1 ${theme.gradientText}`}>{stat.value}</div>
                            <div className={`text-sm ${theme.textBody}`}>{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}