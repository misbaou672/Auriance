import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const sampleTexts = [
    {
        speaker: 'M. Bernard',
        text: 'La réunion budgétaire du Q4 montre une progression de 15% sur les ventes digitales, ce qui dépasse nos prévisions initiales.',
    },
    {
        speaker: 'Sophie',
        text: 'Excellent. Cependant, le coût d\'acquisition client a augmenté de 5%. Nous devons optimiser nos campagnes LinkedIn.',
    },
    {
        speaker: 'M. Bernard',
        text: 'D\'accord. Action à prendre : Valider le recrutement de 2 ingénieurs DevOps avant la fin du mois pour soutenir la charge.',
    },
];

export default function DemoInteractive({ isDark }) {
    const { t } = useLanguage();
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });
    const [isRecording, setIsRecording] = useState(false);
    const [currentText, setCurrentText] = useState('');
    const [textIndex, setTextIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);
    const [waveHeights, setWaveHeights] = useState(Array(30).fill(10));

    useEffect(() => {
        if (!isRecording) return undefined;

        const text = sampleTexts[textIndex].text;
        if (charIndex < text.length) {
            const timeout = setTimeout(() => {
                setCurrentText(prev => prev + text[charIndex]);
                setCharIndex(prev => prev + 1);
            }, 30 + Math.random() * 40);
            return () => clearTimeout(timeout);
        }

        const timeout = setTimeout(() => {
            setTextIndex(prev => (prev + 1) % sampleTexts.length);
            setCharIndex(0);
            setCurrentText('');
        }, 2000);
        return () => clearTimeout(timeout);
    }, [isRecording, charIndex, textIndex]);

    useEffect(() => {
        if (!isRecording) {
            setWaveHeights(Array(30).fill(10));
            return undefined;
        }

        const interval = setInterval(() => {
            setWaveHeights(Array(30).fill(0).map(() => Math.random() * 60 + 15));
        }, 120);

        return () => clearInterval(interval);
    }, [isRecording]);

    const handleToggleRecording = () => {
        setIsRecording(prev => !prev);
        if (!isRecording) {
            setCurrentText('');
            setCharIndex(0);
            setTextIndex(0);
        }
    };

    const theme = isDark ? {
        bg: 'bg-slate-900',
        card: 'bg-[#131420] border-indigo-500/20 shadow-indigo-500/10',
        headerBorder: 'border-white/10',
        textPrimary: 'text-white',
        textSecondary: 'text-gray-400',
        waveBg: 'bg-[#131420]',
        speakerBg: 'bg-indigo-500/20',
        speakerText: 'text-indigo-400',
        cursor: 'bg-indigo-500',
        button: 'bg-indigo-500 hover:bg-indigo-600',
        buttonStop: 'bg-rose-500 hover:bg-rose-600',
        gradientWave: 'linear-gradient(180deg, rgba(99,102,241,0.9) 0%, rgba(139,92,246,0.9) 100%)'
    } : {
        bg: 'bg-gray-50',
        card: 'bg-white border-gray-200 shadow-xl',
        headerBorder: 'border-gray-200',
        textPrimary: 'text-gray-900',
        textSecondary: 'text-gray-500',
        waveBg: 'bg-gray-50',
        speakerBg: 'bg-indigo-100',
        speakerText: 'text-indigo-600',
        cursor: 'bg-indigo-500',
        button: 'bg-indigo-500 hover:bg-indigo-600',
        buttonStop: 'bg-rose-500 hover:bg-rose-600',
        gradientWave: 'linear-gradient(180deg, rgba(99,102,241,0.9) 0%, rgba(139,92,246,0.9) 100%)' // Indigo/Violet
    };

    return (
        <section id="demo-interactive" className={`py-24 transition-colors duration-300 ${isDark ? '' : 'bg-gray-50'}`}>
            <div className="mx-auto max-w-6xl px-6">
                <motion.div
                    ref={ref}
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-12"
                >
                    <span className={`inline-block px-5 py-2 rounded-full border text-sm font-semibold mb-5 ${isDark ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-white border-gray-200 text-gray-900'}`}>
                        {t('home.demo.tag')}
                    </span>
                    <h2 className={`text-4xl sm:text-5xl font-bold tracking-tight mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {t('home.demo.title')}
                    </h2>
                    <p className={`text-lg max-w-2xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {t('home.demo.subtitle')}
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="max-w-4xl mx-auto"
                >
                    <div className={`rounded-3xl border overflow-hidden transition-all duration-300 ${theme.card}`}>
                        <div className={`p-6 border-b flex items-center justify-between ${theme.headerBorder}`}>
                            <div className="flex items-center gap-4">
                                <div
                                    className={`w-4 h-4 rounded-full ${isRecording ? 'bg-rose-500 animate-pulse' : 'bg-gray-300'}`}
                                />
                                <span className={`font-semibold text-lg ${theme.textPrimary}`}>
                                    {isRecording ? t('home.demo.listening') : t('home.demo.readyToListen')}
                                </span>
                            </div>
                            <div className={`flex items-center gap-2 ${theme.textSecondary}`}>
                                <Volume2 className="w-5 h-5" />
                                <span className="text-sm">{t('home.demo.language')}</span>
                            </div>
                        </div>

                        <div className={`p-8 ${theme.waveBg}`}>
                            <div className="flex items-end justify-center gap-1 h-20">
                                {waveHeights.map((height, i) => (
                                    <motion.div
                                        key={i}
                                        className="w-2 rounded-full"
                                        animate={{ height }}
                                        transition={{ duration: 0.12, ease: 'easeOut' }}
                                        style={{
                                            opacity: isRecording ? 0.4 + (height / 75) * 0.6 : 0.3,
                                            background: theme.gradientWave,
                                        }}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="p-8 min-h-[200px]">
                            {isRecording && currentText ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="space-y-4"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${theme.speakerBg}`}>
                                            <span className={`text-sm font-bold ${theme.speakerText}`}>
                                                {sampleTexts[textIndex].speaker.charAt(0)}
                                            </span>
                                        </div>
                                        <div>
                                            <p className={`text-sm mb-1 ${theme.textSecondary}`}>
                                                {sampleTexts[textIndex].speaker}
                                            </p>
                                            <p className={`text-xl leading-relaxed ${theme.textPrimary}`}>
                                                {currentText}
                                                <span className={`inline-block w-0.5 h-6 ml-1 animate-pulse ${theme.cursor}`} />
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className={`flex items-center justify-center h-full ${theme.textSecondary}`}>
                                    <p className="text-lg">{t('home.demo.clickToStart')}</p>
                                </div>
                            )}
                        </div>

                        <div className={`p-8 border-t flex items-center justify-center ${theme.headerBorder}`}>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleToggleRecording}
                                className={`h-16 w-16 rounded-full flex items-center justify-center transition-colors text-white ${isRecording ? theme.buttonStop : theme.button}`}
                            >
                                {isRecording ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
