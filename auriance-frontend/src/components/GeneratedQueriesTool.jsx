import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Copy, Check, Sparkles, Database, GitBranch, Cpu, Terminal, Loader2, Sun, Moon, Globe, ChevronDown, Save, FileDown } from 'lucide-react';
import { VoiceWave } from './VoiceWave';
import { API_BASE_URL, saveTranscription, exportTranscriptionPdf, saveGeneratedQuery } from '../services/api';

const queryTypes = [
    {
        id: "sql",
        label: "SQL",
        icon: Database,
        color: "#22d3ee",
        bgColor: "rgba(34, 211, 238, 0.1)",
        borderColor: "rgba(34, 211, 238, 0.3)",
    },
    {
        id: "cypher",
        label: "Cypher",
        icon: GitBranch,
        color: "#f43f5e",
        bgColor: "rgba(244, 63, 94, 0.1)",
        borderColor: "rgba(244, 63, 94, 0.3)",
    },
    {
        id: "vector",
        label: "Vectoriel",
        icon: Cpu,
        color: "#a78bfa",
        bgColor: "rgba(167, 139, 250, 0.1)",
        borderColor: "rgba(167, 139, 250, 0.3)",
    },
];

const LANGUAGES = [
    { code: 'fr-FR', label: 'Français', flag: '🇫🇷' },
    { code: 'en-US', label: 'English', flag: '🇺🇸' },
    { code: 'es-ES', label: 'Español', flag: '🇪🇸' },
    { code: 'de-DE', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'it-IT', label: 'Italiano', flag: '🇮🇹' },
    { code: 'pt-PT', label: 'Português', flag: '🇵🇹' },
    { code: 'nl-NL', label: 'Nederlands', flag: '🇳🇱' },
    { code: 'ru-RU', label: 'Русский', flag: '🇷🇺' },
    { code: 'zh-CN', label: '中文', flag: '🇨🇳' },
    { code: 'ja-JP', label: '日本語', flag: '🇯🇵' },
];

// Utilitaire pour la reconnaissance vocale navigateur (Web Speech API)
function useSpeechToText({ onResult, lang = 'fr-FR' }) {
    const [isRecording, setIsRecording] = useState(false);
    const recognitionRef = useRef(null);

    useEffect(() => {
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) return;
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.lang = lang;
        recognitionRef.current.interimResults = false; // On ne prend que le final pour l'intent
        recognitionRef.current.maxAlternatives = 1;

        recognitionRef.current.onstart = () => setIsRecording(true);
        recognitionRef.current.onend = () => setIsRecording(false);
        recognitionRef.current.onerror = () => setIsRecording(false);

        recognitionRef.current.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            onResult(transcript);
        };

    }, [lang, onResult]);

    const start = () => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.start();
            } catch (e) {
                console.error("Erreur start recognition:", e);
            }
        }
    };
    const stop = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    };

    // Toggle helper
    const toggle = () => isRecording ? stop() : start();

    return { isRecording, toggle };
}

export default function GeneratedQueriesTool({ onBack }) {
    const [isDark, setIsDark] = useState(true);
    const [language, setLanguage] = useState('fr-FR');
    const [showLangMenu, setShowLangMenu] = useState(false);

    const [intent, setIntent] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    // Stocke les résultats finals complets venant de l'API
    const [results, setResults] = useState({ sql: "", cypher: "", vector: "", ragAnswer: "" });
    // Stocke ce qui est affiché (pour l'animation d'écriture)
    const [displayedQueries, setDisplayedQueries] = useState({ sql: "", cypher: "", vector: "" });

    const [copiedId, setCopiedId] = useState(null);
    const [showResults, setShowResults] = useState(false);
    const [error, setError] = useState('');

    const [notification, setNotification] = useState(null);

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    // STT
    const { isRecording, toggle: toggleListening } = useSpeechToText({
        onResult: (text) => setIntent(text),
        lang: language
    });

    // Fonction pour simuler l'écriture machine
    const typeWriterEffect = async (type, fullText) => {
        if (!fullText) return;
        for (let i = 0; i <= fullText.length; i++) {
            setDisplayedQueries(prev => ({
                ...prev,
                [type]: fullText.slice(0, i)
            }));
            // Vitesse de frappe
            await new Promise(resolve => setTimeout(resolve, 5));
        }
    };

    const handleGenerate = async () => {
        if (!intent.trim()) {
            setError("Veuillez dicter ou saisir une intention.");
            return;
        }
        setIsLoading(true);
        setError('');
        setShowResults(true);
        // Reset affichage
        setDisplayedQueries({ sql: "", cypher: "", vector: "" });
        setResults({ sql: "", cypher: "", vector: "", ragAnswer: "" });

        try {
            const formData = new FormData();
            formData.append('intent', intent);

            // Appel API parallèle (SQL + Cypher)
            // Note: Pour Vector, on simule ou on ajoute un endpoint si dispo
            const [sqlRes, cypherRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/auriance/generate-sql-query`, {
                    method: 'POST',
                    body: formData
                }),
                fetch(`${API_BASE_URL}/api/auriance/generate-cypher-query`, {
                    method: 'POST',
                    body: formData
                })
            ]);

            const sqlData = await sqlRes.json();
            const cypherData = await cypherRes.json();

            // Formatage des réponses de l'API
            const finalSql = sqlData.sql || JSON.stringify(sqlData, null, 2);
            const finalCypher = cypherData.cypher || JSON.stringify(cypherData, null, 2);
            // Extraction basique de l'année pour la démo vectorielle
            const yearMatch = intent.match(/\b202[0-9]\b/);
            const demoYear = yearMatch ? yearMatch[0] : new Date().getFullYear();

            // Simulation Vector dynamique
            const finalVector = `{
  "collection": "consultations",
  "vector": embedding("${intent}"),
  "top_k": 5,
  "filter": { "year": ${demoYear} }
}`;
            const ragAns = "Génération des requêtes terminée. Prêt pour exécution.";

            // Mise à jour de l'état "vérité terrain"
            setResults({
                sql: finalSql,
                cypher: finalCypher,
                vector: finalVector,
                ragAnswer: ragAns
            });

            // Lancement des animations séquentiellement pour l'effet Wow
            await typeWriterEffect("sql", finalSql);
            await typeWriterEffect("cypher", finalCypher);
            await typeWriterEffect("vector", finalVector);

        } catch (e) {
            console.error(e);
            setError('Erreur lors de la communication avec le serveur Auriance.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!results.sql && !results.cypher) return;
        const token = localStorage.getItem('token');
        if (!token) {
            showNotification("Vous devez être connecté pour sauvegarder.", "error");
            return;
        }

        try {
            // Sauvegarder chaque type de requête séparément
            const queries = [];

            if (results.sql) {
                queries.push({
                    query_text: results.sql,
                    query_type: 'sql',
                    context: intent,
                    language: language
                });
            }

            if (results.cypher) {
                queries.push({
                    query_text: results.cypher,
                    query_type: 'cypher',
                    context: intent,
                    language: language
                });
            }

            // Sauvegarder toutes les requêtes avec le service centralisé
            for (const query of queries) {
                await saveGeneratedQuery(query, token);
            }

            showNotification("Requêtes sauvegardées avec succès !");
        } catch (e) {
            console.error(e);
            showNotification("Erreur lors de la sauvegarde.", "error");
        }
    };

    const handleExportPdf = async () => {
        if (!results.sql && !results.cypher) return;
        const token = localStorage.getItem('token');

        // Détection du domaine pour le style PDF
        const content_lower = intent.toLowerCase();
        let docType = 'live';
        if (content_lower.match(/patient|symptôme|diagnostic|santé|médical/i)) docType = 'medical';
        else if (content_lower.match(/espèce|biodiversité|faune|flore|observation/i)) docType = 'biodiversity';
        else if (content_lower.match(/chantier|travaux|projet|construction|btp/i)) docType = 'construction';

        try {
            const content = `INTENTION:\n${intent}\n\n=== SQL ===\n${results.sql}\n\n=== CYPHER ===\n${results.cypher}\n\n=== VECTOR ===\n${results.vector}`;

            const pdfBlob = await exportTranscriptionPdf(
                {
                    text: content,
                    duration: 0,
                    language: language,
                    title: `Requête IA - ${new Date().toLocaleDateString()}`,
                    type: docType
                },
                token
            );

            const url = window.URL.createObjectURL(pdfBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `auriance_queries_${Date.now()}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            showNotification("PDF exporté avec succès !");
        } catch (e) {
            console.error(e);
            showNotification("Erreur lors de l'export PDF.", "error");
        }
    };

    const handleCopy = async (id, code) => {
        await navigator.clipboard.writeText(code);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className={`fixed inset-0 z-50 overflow-y-auto w-full h-full transition-colors duration-500 ease-in-out ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-50 transition-colors duration-700 ${isDark ? 'bg-cyan-500/10' : 'bg-cyan-500/5'}`} />
                <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-50 transition-colors duration-700 ${isDark ? 'bg-violet-500/10' : 'bg-violet-500/5'}`} />
                <div className={`absolute top-1/2 left-1/2 w-96 h-96 rounded-full blur-3xl opacity-50 transition-colors duration-700 ${isDark ? 'bg-rose-500/5' : 'bg-rose-500/5'}`} />
            </div>

            <div className="relative max-w-5xl mx-auto space-y-8 p-8 pb-20">
                {/* Header Row: Back + Controls */}
                <div className="flex items-center justify-between pt-4 relative z-20">
                    {/* Back Button */}
                    {onBack && (
                        <button
                            onClick={onBack}
                            className={`p-2.5 rounded-full transition-all group border ${isDark ? 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10' : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 shadow-sm'}`}
                            title="Retour"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left group-hover:-translate-x-1 transition-transform"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
                        </button>
                    )}

                    {/* Right Controls: Language + Theme */}
                    <div className="flex items-center gap-3">
                        {/* Language Selector */}
                        <div className="relative">
                            <button
                                onClick={() => setShowLangMenu(!showLangMenu)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium border transition-all ${isDark
                                    ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'
                                    }`}
                            >
                                <Globe className="w-4 h-4" />
                                <span>{LANGUAGES.find(l => l.code === language)?.flag}</span>
                                <ChevronDown className="w-3 h-3 opacity-50" />
                            </button>

                            {showLangMenu && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setShowLangMenu(false)} />
                                    <div className={`absolute right-0 top-full mt-2 w-48 rounded-xl border shadow-xl z-30 max-h-64 overflow-y-auto custom-scrollbar p-1.5 ${isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'
                                        }`}>
                                        {LANGUAGES.map((lang) => (
                                            <button
                                                key={lang.code}
                                                onClick={() => {
                                                    setLanguage(lang.code);
                                                    setShowLangMenu(false);
                                                }}
                                                className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${language === lang.code
                                                    ? isDark ? 'bg-cyan-500/20 text-cyan-400' : 'bg-cyan-50 text-cyan-700'
                                                    : isDark ? 'text-slate-300 hover:bg-white/5' : 'text-slate-700 hover:bg-slate-50'
                                                    }`}
                                            >
                                                <span className="text-lg">{lang.flag}</span>
                                                <span className="flex-1 text-left">{lang.label}</span>
                                                {language === lang.code && <Check className="w-3 h-3" />}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Theme Toggle */}
                        <button
                            onClick={() => setIsDark(!isDark)}
                            className={`p-2 rounded-full transition-all duration-300 ${isDark
                                ? 'bg-white/5 text-yellow-400 hover:bg-white/10 ring-1 ring-white/10'
                                : 'bg-white text-slate-900 hover:bg-slate-100 shadow-sm ring-1 ring-slate-300'
                                }`}
                        >
                            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Title Section */}
                <div className="text-center space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${isDark ? 'bg-white/5 border-white/10 text-cyan-400' : 'bg-white border-slate-200 text-cyan-600 shadow-sm'}`}
                    >
                        <Terminal className="w-4 h-4" />
                        Mode Deep Tech
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className={`text-4xl md:text-5xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}
                    >
                        Générateur de{" "}
                        <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-rose-400 bg-clip-text text-transparent">
                            Requêtes IA
                        </span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className={`max-w-xl mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600 font-medium'}`}
                    >
                        Transformez vos intentions naturelles en requêtes SQL, Cypher et Vectorielles complexes grâce à Auriance Engine.
                    </motion.p>
                </div>

                {/* Input Console */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className={`backdrop-blur-xl rounded-2xl border overflow-hidden shadow-2xl transition-all duration-500 ${isDark
                        ? 'bg-black/40 border-white/10 shadow-cyan-900/10'
                        : 'bg-white border-slate-200 shadow-slate-200/50'
                        }`}
                >
                    {/* Terminal Header */}
                    <div className={`flex items-center gap-2 px-4 py-3 border-b ${isDark ? 'border-white/10 bg-black/40' : 'border-slate-100 bg-slate-50/50'}`}>
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                        </div>
                        <span className={`text-xs font-mono ml-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>auriance://query-gen --v2</span>
                    </div>

                    {/* Input Area */}
                    <div className="p-6 space-y-4">
                        <div className="flex gap-4">
                            <div className="flex-1 relative group">
                                <div className={`absolute left-4 top-1/2 -translate-y-1/2 font-mono text-sm pointer-events-none ${isDark ? 'text-cyan-500' : 'text-cyan-600'}`}>
                                    {">"}
                                </div>
                                <input
                                    type="text"
                                    value={intent}
                                    onChange={(e) => setIntent(e.target.value)}
                                    placeholder="Ex: Patients ayant de la fièvre depuis janvier 2024..."
                                    className={`w-full rounded-xl pl-8 pr-4 py-4 font-mono text-sm focus:outline-none focus:ring-2 transition-all border ${isDark
                                        ? 'bg-white/5 border-white/10 text-white placeholder-slate-600 focus:ring-cyan-500/50 focus:border-cyan-500/50 focus:bg-white/10'
                                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-cyan-500/30 focus:border-cyan-500/50 focus:bg-white'
                                        }`}
                                    onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                                />
                                {isRecording && (
                                    <motion.div
                                        className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-rose-500"
                                        animate={{ opacity: [1, 0.3, 1] }}
                                        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                                    />
                                )}
                            </div>

                            {/* Mic Button */}
                            <motion.button
                                onClick={toggleListening}
                                whileTap={{ scale: 0.95 }}
                                className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all border ${isRecording
                                    ? "bg-rose-500/20 border-rose-500/50 text-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]"
                                    : isDark
                                        ? "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/20"
                                        : "bg-white border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-300 shadow-sm"
                                    }`}
                                title={isRecording ? "Arrêter d'écouter" : "Dicter la requête"}
                            >
                                {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                            </motion.button>

                            {/* Generate Button */}
                            <motion.button
                                onClick={handleGenerate}
                                disabled={!intent.trim() || isLoading}
                                whileTap={{ scale: 0.95 }}
                                className="px-6 py-4 bg-gradient-to-r from-cyan-600 to-violet-600 text-white rounded-xl font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:from-cyan-500 hover:to-violet-500 transition-all min-w-[140px] justify-center"
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                                <span>Générer</span>
                            </motion.button>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="text-rose-500 text-sm bg-rose-500/10 border border-rose-500/20 p-3 rounded-lg"
                            >
                                {error}
                            </motion.div>
                        )}

                        {/* Voice Wave Visualizer */}
                        <AnimatePresence>
                            {isRecording && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="pt-2">
                                        <VoiceWave isActive={isRecording} barCount={40} className="h-12" color={isDark ? "rgb(6, 182, 212)" : "rgb(8, 145, 178)"} />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* Results Grid */}
                <AnimatePresence mode="wait">
                    {showResults && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="grid gap-6"
                        >
                            {queryTypes.map((type, index) => {
                                const Icon = type.icon;
                                const code = displayedQueries[type.id] || "";
                                const isTyping = isLoading || (code.length < results[type.id]?.length);

                                return (
                                    <motion.div
                                        key={type.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.15 }}
                                        className={`backdrop-blur-xl rounded-2xl border overflow-hidden transition-colors duration-300 ${isDark ? 'bg-black/40' : 'bg-white shadow-lg shadow-slate-200/50'}`}
                                        style={{ borderColor: isDark ? type.borderColor : type.color + '40' }} // Opacité plus forte en light
                                    >
                                        {/* Result Header */}
                                        <div
                                            className="flex items-center justify-between px-4 py-3 border-b"
                                            style={{
                                                borderColor: isDark ? type.borderColor : type.color + '40',
                                                backgroundColor: isDark ? type.bgColor : type.color + '10'
                                            }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                                                    style={{ backgroundColor: `${type.color}20` }}
                                                >
                                                    <Icon className="w-4 h-4" style={{ color: type.color }} />
                                                </div>
                                                <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{type.label}</span>
                                            </div>
                                            <button
                                                onClick={() => handleCopy(type.id, results[type.id])} // Copie le résultat complet
                                                disabled={!results[type.id]}
                                                className={`p-2 rounded-lg transition-colors disabled:opacity-30 ${isDark ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-black/5 text-slate-500 hover:text-slate-900'}`}
                                                title="Copier le code"
                                            >
                                                {copiedId === type.id ? (
                                                    <Check className="w-4 h-4 text-emerald-500" />
                                                ) : (
                                                    <Copy className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>

                                        {/* Code Block Content */}
                                        <div className="p-4 overflow-x-auto relative min-h-[100px] flex items-start">
                                            <pre className={`font-mono text-sm whitespace-pre-wrap w-full ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
                                                {code || (
                                                    <span className={`${isDark ? 'text-slate-600' : 'text-slate-400'} italic`}>
                                                        {isLoading ? "Génération en cours..." : "En attente..."}
                                                    </span>
                                                )}
                                                {/* Curseurs clignotants */}
                                                {isTyping && (
                                                    <motion.span
                                                        className="inline-block w-2 h-4 ml-0.5 bg-cyan-400 align-middle"
                                                        animate={{ opacity: [1, 0] }}
                                                        transition={{ duration: 0.5, repeat: Number.POSITIVE_INFINITY }}
                                                    />
                                                )}
                                            </pre>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* RAG Context Info */}
                {showResults && !isLoading && results.ragAnswer && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`backdrop-blur-xl rounded-2xl p-6 border ${isDark ? 'bg-gradient-to-br from-cyan-500/10 to-violet-500/10 border-white/10' : 'bg-white border-slate-200 shadow-xl'}`}
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/20">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Analyse Auriance terminé</h3>
                                <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                    Les requêtes ont été générées avec succès. Ces instructions sont prêtes à être exécutées par le moteur RAG pour interroger la base de données relationnelle, le graphe de connaissances et le store vectoriel simultanément.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Actions Footer */}
                {showResults && !isLoading && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-end gap-4 pt-4 border-t border-white/5"
                    >
                        <button
                            onClick={handleExportPdf}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${isDark
                                ? 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm'
                                }`}
                        >
                            <FileDown className="w-4 h-4" />
                            <span>Exporter en PDF</span>
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-cyan-600 text-white rounded-xl font-medium shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 hover:from-violet-500 hover:to-cyan-500 transition-all border border-white/10"
                        >
                            <Save className="w-4 h-4" />
                            <span>Sauvegarder</span>
                        </button>
                    </motion.div>
                )}
            </div>

            {/* Notification Toast */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: 20, x: '-50%' }}
                        className={`fixed bottom-8 left-1/2 px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 z-50 border ${notification.type === 'error'
                            ? 'bg-rose-500 text-white border-rose-400'
                            : isDark
                                ? 'bg-emerald-500/90 text-white border-emerald-400/50 backdrop-blur-md'
                                : 'bg-emerald-600 text-white border-emerald-500'
                            }`}
                    >
                        {notification.type === 'error' ? (
                            <div className="bg-white/20 p-1 rounded-full"><MicOff className="w-4 h-4" /></div> // Fallback icon or X
                        ) : (
                            <div className="bg-white/20 p-1 rounded-full"><Check className="w-4 h-4" /></div>
                        )}
                        <span className="font-medium">{notification.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: ${isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.05)'};
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.2)'};
                    border-radius: 4px;
                }
            `}</style>
        </div>
    );
}
