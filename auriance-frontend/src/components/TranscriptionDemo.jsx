import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import {
    Mic,
    MicOff,
    Pause,
    Play,
    Square,
    FileText,
    Download,
    Copy,
    Check,
    Clock,
    Wand2,
    AlertCircle,
    Volume2
} from 'lucide-react';
import { VoiceWave } from './VoiceWave';

export default function TranscriptionDemo({ isDark }) {
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [duration, setDuration] = useState(0);
    const [transcript, setTranscript] = useState([]); // [{speaker: 'Vous', text: '...', time: '...'}]
    const [copied, setCopied] = useState(false);
    const [showExtraction, setShowExtraction] = useState(false);
    const [extractedData, setExtractedData] = useState([]);

    // Refs pour SpeechRecognition
    const recognitionRef = useRef(null);
    const isListeningRef = useRef(false);
    const transcriptRef = useRef('');
    const durationRef = useRef(0);

    // Timer
    useEffect(() => {
        let interval;
        if (isRecording && !isPaused) {
            interval = setInterval(() => {
                setDuration(prev => {
                    const next = prev + 1;
                    durationRef.current = next;
                    return next;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRecording, isPaused]);

    const formatTime = useCallback((seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, []);

    const getCurrentTime = () => formatTime(durationRef.current);

    const { t, currentLanguage } = useLanguage();

    // --- LOGIQUE STT (Speech To Text) ---

    const stopRecognition = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            isListeningRef.current = false;
        }
    };

    const startRecognition = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Votre navigateur ne supporte pas la reconnaissance vocale.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = t('locale') || 'fr-FR';
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onstart = () => {
            isListeningRef.current = true;
        };

        recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }

            if (finalTranscript) {
                setTranscript(prev => {
                    // Si le dernier segment est le même locuteur et récent, on concatène
                    const last = prev[prev.length - 1];
                    if (last && last.speaker === 'Vous' && !last.isFinal) {
                        // Update last segment
                        return [...prev.slice(0, -1), { ...last, text: last.text + ' ' + finalTranscript, isFinal: true }];
                    }
                    return [...prev, { time: getCurrentTime(), speaker: 'Vous', text: finalTranscript, isFinal: true }];
                });
            }
        };

        recognition.onerror = (event) => {
            console.error(event.error);
            if (event.error === 'not-allowed') {
                alert("Accès au micro refusé.");
                setIsRecording(false);
            }
        };

        recognitionRef.current = recognition;
        recognition.start();
    };


    const handleStartRecording = () => {
        setIsRecording(true);
        setIsPaused(false);
        setTranscript([]);
        setDuration(0);
        durationRef.current = 0;
        setShowExtraction(false);
        setExtractedData([]);
        startRecognition();
    };

    const handleStopRecording = () => {
        setIsRecording(false);
        setIsPaused(false);
        stopRecognition();

        // Simuler une "analyse" pour l'extraction automatique à la fin
        // On va juste activer l'UI pour qu'ils cliquent sur "Extraire"
    };

    const handleCopy = async () => {
        const text = transcript.map(t => `[${t.time}] ${t.speaker}: ${t.text}`).join('\n');
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // --- LOGIQUE EXTRACTION SMART (Simulation locale) ---
    const runSmartExtraction = () => {
        const fullText = transcript.map(t => t.text).join(' ');

        // Analyse très basique pour la démo
        const budgetMatch = fullText.match(/(\d+(?:[.,]\d+)?)\s?(?:€|k€|euros|millions)/i);
        const dateMatch = fullText.match(/(?:dès|pour|avant|en)\s(le\s)?(\d{1,2}\s)?[janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre|lundi|mardi|mercredi|jeudi|vendredi]/i); // Simplifié

        const newFields = [
            extractedData.find(f => f.label === 'Projet') || { label: 'Projet', value: 'Non détecté', confidence: 40 },
            {
                label: 'Budget détecté',
                value: budgetMatch ? budgetMatch[0] : 'Non détecté',
                confidence: budgetMatch ? 95 : 20
            },
            {
                label: 'Date clé',
                value: 'Jeudi Prochain', // Hardcodé pour l'exemple si pas trouvé, ou regex plus complexe
                confidence: 85
            },
            { label: 'Action', value: 'Revue Design', confidence: 88 }, // Exemple statique pour démo
        ];

        // Pour la démo, si le texte est très court (test utilisateur), on met des valeurs par défaut pour pas que ça fasse vide
        if (transcript.length < 2) {
            setExtractedData([
                { label: 'Sujet', value: 'Réunion générale', confidence: 90 },
                { label: 'Action', value: 'À définir', confidence: 50 },
            ]);
        } else {
            // On garde les champs "statiques" de la démo si rien n'est trouvé, pour montrer l'UI
            setExtractedData([
                { label: 'Sujet', value: 'Discussion Projet', confidence: 92 },
                { label: 'Mots-clés', value: 'Budget, Planning', confidence: 85 },
                { label: 'Action requise', value: 'Validation', confidence: 78 },
                { label: 'Urgence', value: 'Moyenne', confidence: 60 },
            ]);
        }

        setShowExtraction(true);
    };


    const wordCount = useMemo(() => transcript.reduce((acc, t) => acc + (t.text ? t.text.split(' ').length : 0), 0), [transcript]);

    const theme = isDark ? {
        bg: 'bg-transparent',
        textPrimary: 'text-white',
        textSecondary: 'text-gray-400',
        cardBg: 'bg-[#131420]',
        cardBorder: 'border-white/10',
        inputBg: 'bg-white/5 border-white/10',
        accentText: 'text-indigo-400',
        accentBg: 'bg-indigo-500',
        accentBgLight: 'bg-indigo-500/10',
        speakerUser: 'text-indigo-400',
        speakerOther: 'text-violet-400',
        transcriptBgUser: 'bg-indigo-500/10 border-indigo-500/20',
        transcriptBgOther: 'bg-white/5 border-white/5',
        buttonPrimary: 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/25',
        buttonSecondary: 'bg-white/5 border-white/10 text-white hover:bg-white/10',
        extractionBg: 'bg-gradient-to-br from-indigo-900/20 to-violet-900/10 border-indigo-500/20',
        fieldBg: 'bg-white/5 border-white/10',
        confidenceBadge: 'bg-indigo-500/20 text-indigo-300'
    } : {
        bg: 'bg-white',
        textPrimary: 'text-gray-900',
        textSecondary: 'text-gray-500',
        cardBg: 'bg-gray-50',
        cardBorder: 'border-gray-200',
        inputBg: 'bg-white border-gray-200',
        accentText: 'text-indigo-600',
        accentBg: 'bg-indigo-500',
        accentBgLight: 'bg-indigo-50',
        speakerUser: 'text-indigo-600',
        speakerOther: 'text-gray-500',
        transcriptBgUser: 'bg-indigo-50 border-indigo-100',
        transcriptBgOther: 'bg-white',
        buttonPrimary: 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/25',
        buttonSecondary: 'bg-white border-gray-200 hover:bg-gray-50',
        extractionBg: 'bg-gradient-to-br from-indigo-50 to-transparent border-indigo-200',
        fieldBg: 'bg-gradient-to-br from-white to-indigo-50/30 border-indigo-100',
        confidenceBadge: 'bg-indigo-100 text-indigo-700'
    };

    return (
        <section className={`py-20 transition-colors duration-300 ${theme.bg}`} id="demo">
            <div className="max-w-6xl mx-auto px-6 space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className={`text-3xl md:text-4xl font-bold ${theme.textPrimary}`}>
                            Transcription <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">Interactive</span>
                        </h2>
                        <p className={`${theme.textSecondary} mt-2`}>
                            Testez la reconnaissance vocale en temps réel directement depuis votre navigateur.
                        </p>
                    </div>
                    <div className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${isRecording ? 'bg-red-500 text-white animate-pulse' : (isDark ? 'bg-white/10 text-gray-300' : 'bg-gray-100 text-gray-600')}`}>
                        <span className={`w-2 h-2 rounded-full ${isRecording ? 'bg-white' : 'bg-gray-400'}`} />
                        {isRecording ? (isPaused ? 'En pause' : 'Enregistrement...') : 'Prêt'}
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    <div className={`lg:col-span-2 border rounded-2xl p-6 ${theme.cardBg} ${theme.cardBorder}`}>
                        <div className={`relative rounded-2xl p-6 mb-6 overflow-hidden border ${isDark ? 'bg-[#0f1016]' : 'bg-white'} ${theme.cardBorder}`}>
                            {isRecording && !isPaused && (
                                <>
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-violet-500/10 to-indigo-500/5 animate-gradient" />
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
                                </>
                            )}
                            <div className="relative z-10">
                                <VoiceWave isActive={isRecording && !isPaused} barCount={60} className="h-24" color={isDark ? '#818cf8' : '#6366f1'} />
                            </div>
                            <div className={`absolute bottom-4 right-4 flex items-center gap-2 px-3 py-1.5 backdrop-blur rounded-full text-sm font-mono ${isDark ? 'bg-black/40 text-white' : 'bg-white/80 text-gray-900 border border-gray-100'}`}>
                                <Clock className={`w-4 h-4 ${theme.accentText}`} />
                                {formatTime(duration)}
                            </div>
                        </div>

                        <div className="flex items-center justify-center gap-4 flex-wrap">
                            {!isRecording ? (
                                <button
                                    onClick={handleStartRecording}
                                    className={`h-14 px-8 rounded-2xl font-semibold flex items-center gap-3 transition-transform hover:scale-105 ${theme.buttonPrimary}`}
                                >
                                    <Mic className="w-6 h-6" />
                                    Démarrer le test
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={handleStopRecording}
                                        className="h-12 px-6 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-semibold flex items-center gap-2 transition-colors"
                                    >
                                        <Square className="w-5 h-5 fill-current" />
                                        Arrêter
                                    </button>
                                </>
                            )}
                        </div>

                        {!isRecording && transcript.length === 0 && (
                            <div className={`mt-6 p-4 rounded-xl border flex items-start gap-3 ${isDark ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-indigo-50 border-indigo-100'}`}>
                                <AlertCircle className={`w-5 h-5 shrink-0 mt-0.5 ${theme.accentText}`} />
                                <div className={`text-sm ${theme.textSecondary}`}>
                                    <p className={`font-medium mb-1 ${theme.textPrimary}`}>Autorisez l'accès au micro</p>
                                    <ul className="space-y-1 opacity-80">
                                        <li>Cliquez sur "Démarrer le test" et acceptez la permission.</li>
                                        <li>Parlez naturellement pour voir la transcription s'afficher.</li>
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div className={`border rounded-2xl p-4 ${isDark ? 'bg-[#131420]' : 'bg-white'} ${theme.cardBorder}`}>
                            <div className={`flex items-center gap-2 text-sm mb-4 ${theme.textSecondary}`}>
                                <Volume2 className="w-4 h-4" />
                                Statistiques
                            </div>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className={theme.textSecondary}>Mots transcrits</span>
                                    <span className={`font-semibold ${theme.textPrimary}`}>{wordCount}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className={theme.textSecondary}>Durée</span>
                                    <span className={`font-semibold font-mono ${theme.textPrimary}`}>{formatTime(duration)}</span>
                                </div>
                            </div>
                        </div>

                        <div className={`border rounded-2xl p-4 space-y-2 ${isDark ? 'bg-[#131420]' : 'bg-white'} ${theme.cardBorder}`}>
                            <p className={`text-sm font-medium ${theme.textSecondary}`}>Actions</p>
                            <button
                                onClick={handleCopy}
                                disabled={transcript.length === 0}
                                className={`w-full px-3 py-2 rounded-xl border text-sm flex items-center gap-2 disabled:opacity-50 transition-colors ${theme.buttonSecondary}`}
                            >
                                {copied ? <Check className={`w-4 h-4 ${theme.accentText}`} /> : <Copy className="w-4 h-4" />}
                                {copied ? 'Copié !' : 'Copier le texte'}
                            </button>
                            <button
                                disabled={transcript.length === 0}
                                onClick={runSmartExtraction}
                                className={`w-full px-3 py-2 rounded-xl border text-sm flex items-center gap-2 disabled:opacity-50 transition-colors ${theme.buttonSecondary}`}
                            >
                                <Wand2 className="w-4 h-4" />
                                {showExtraction ? 'Ré-analyser' : 'Extraire les données'}
                            </button>
                        </div>
                    </div>
                </div>

                {transcript.length > 0 && (
                    <div className={`border rounded-2xl ${isDark ? 'bg-[#131420]' : 'bg-white'} ${theme.cardBorder}`}>
                        <div className={`px-6 py-4 border-b flex items-center justify-between ${theme.cardBorder}`}>
                            <h3 className={`text-lg font-semibold flex items-center gap-2 ${theme.textPrimary}`}>
                                <FileText className={`w-5 h-5 ${theme.accentText}`} />
                                Transcription Temps Réel
                            </h3>
                            <button onClick={handleCopy} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}>
                                <Copy className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
                            {transcript.map((item, index) => (
                                <div
                                    key={index}
                                    className={`flex gap-4 p-4 rounded-xl transition-all border ${theme.transcriptBgUser}`}
                                >
                                    <div className={`text-xs font-mono w-12 shrink-0 ${theme.textSecondary}`}>{item.time}</div>
                                    <div className="flex-1">
                                        <span className={`text-sm font-medium ${theme.speakerUser}`}>
                                            {item.speaker}
                                        </span>
                                        <p className={`mt-1 ${theme.textPrimary}`}>{item.text}</p>
                                    </div>
                                </div>
                            ))}
                            {isRecording && (
                                <div className={`flex items-center gap-2 text-sm animate-pulse ${theme.textSecondary}`}>
                                    <div className={`w-2 h-2 rounded-full ${theme.accentBg}`} />
                                    En écoute...
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {showExtraction && (
                    <div className={`border rounded-2xl p-6 ${theme.extractionBg}`}>
                        <h3 className={`text-lg font-semibold flex items-center gap-2 mb-4 ${theme.textPrimary}`}>
                            <Wand2 className={`w-5 h-5 ${theme.accentText}`} />
                            Analyse IA (Simulation)
                        </h3>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {extractedData.map((field, index) => (
                                <div
                                    key={field.label}
                                    className={`p-4 rounded-xl border ${theme.fieldBg}`}
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className={`text-sm ${theme.textSecondary}`}>{field.label}</span>
                                        <span className={`text-xs px-2 py-1 rounded-full ${theme.confidenceBadge}`}>
                                            {field.confidence}%
                                        </span>
                                    </div>
                                    <p className={`font-medium ${theme.textPrimary}`}>{field.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
