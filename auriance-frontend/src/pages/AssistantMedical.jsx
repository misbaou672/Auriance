import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, MessageSquare, FileText, ClipboardList,
    Send, Loader2, Search, Filter, Brain, Database,
    ChevronDown, ChevronUp, AlertCircle, CheckCircle,
    Mic, MicOff, Sparkles, RefreshCw, Link2, User,
    Sun, Moon
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import {
    assistantQuery,
    getFilteredTranscriptions,
    analyzeTranscription,
    generatePatientReport,
} from '../services/api';

export default function AssistantMedical({ onBack, user }) {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState('chat');
    const [isDarkMode, setIsDarkMode] = useState(true);

    // ===== TAB 1: Chat State =====
    const [messages, setMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [isQuerying, setIsQuerying] = useState(false);
    const messagesEndRef = useRef(null);

    // ===== TAB 2: Transcriptions State =====
    const [transcriptions, setTranscriptions] = useState([]);
    const [transFilters, setTransFilters] = useState({});
    const [selectedTranscription, setSelectedTranscription] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [loadingTrans, setLoadingTrans] = useState(false);

    // ===== TAB 3: Reports State =====
    const [patientId, setPatientId] = useState('');
    const [reportType, setReportType] = useState('medical');
    const [generatedReport, setGeneratedReport] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const tabs = [
        { id: 'chat', label: 'Chat IA', icon: MessageSquare },
        { id: 'transcriptions', label: 'Transcriptions', icon: ClipboardList },
        { id: 'reports', label: 'Rapports', icon: FileText },
    ];

    const theme = isDarkMode ? {
        bg: 'bg-[#020617]',
        card: 'bg-[#0f172a] border-white/10',
        cardHover: 'hover:bg-[#1e293b]',
        text: 'text-white',
        textSec: 'text-slate-400',
        input: 'bg-[#1e293b] border-white/10 text-white placeholder-slate-500',
        tabActive: 'bg-violet-600 text-white',
        tabInactive: 'text-slate-400 hover:text-white',
        badge: 'bg-violet-500/20 text-violet-400',
        userBubble: 'bg-violet-600 text-white',
        aiBubble: 'bg-[#1e293b] text-slate-200 border border-white/10',
    } : {
        bg: 'bg-slate-50',
        card: 'bg-white border-slate-200 shadow-sm',
        cardHover: 'hover:bg-slate-50',
        text: 'text-slate-900',
        textSec: 'text-slate-500',
        input: 'bg-white border-slate-300 text-slate-900 placeholder-slate-400',
        tabActive: 'bg-violet-600 text-white',
        tabInactive: 'text-slate-500 hover:text-slate-900',
        badge: 'bg-violet-100 text-violet-700',
        userBubble: 'bg-violet-600 text-white',
        aiBubble: 'bg-white text-slate-800 border border-slate-200 shadow-sm',
    };

    // Auto scroll chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // ===== Chat Handlers =====
    const handleSendChat = async () => {
        if (!chatInput.trim() || isQuerying) return;
        const question = chatInput.trim();
        setChatInput('');
        setMessages(prev => [...prev, { role: 'user', content: question }]);
        setIsQuerying(true);

        try {
            const result = await assistantQuery(question);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: result.interpretation || 'Aucun resultat.',
                sql: result.sql_generated,
                results: result.results,
                error: result.error,
            }]);
        } catch (err) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: err.message || "L'assistant IA est temporairement indisponible.",
                error: true,
            }]);
        } finally {
            setIsQuerying(false);
        }
    };

    const exampleQuestions = [
        "Combien de patients ai-je ?",
        "Liste des dernieres transcriptions",
        "Quels patients ont ete vus recemment ?",
    ];

    // ===== Transcriptions Handlers =====
    const loadTranscriptions = async () => {
        setLoadingTrans(true);
        try {
            const data = await getFilteredTranscriptions(transFilters);
            setTranscriptions(data);
        } catch (err) {
            console.error('Failed to load transcriptions:', err);
        } finally {
            setLoadingTrans(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'transcriptions') {
            loadTranscriptions();
        }
    }, [activeTab, transFilters]);

    const handleAnalyze = async (transcriptionId) => {
        setIsAnalyzing(true);
        try {
            const result = await analyzeTranscription(transcriptionId);
            setSelectedTranscription(result);
            loadTranscriptions();
        } catch (err) {
            console.error('Analysis failed:', err);
        } finally {
            setIsAnalyzing(false);
        }
    };

    // ===== Report Handlers =====
    const handleGenerateReport = async () => {
        if (!patientId) return;
        setIsGenerating(true);
        setGeneratedReport(null);
        try {
            const result = await generatePatientReport({
                patient_id: parseInt(patientId),
                report_type: reportType,
                format: 'markdown',
            });
            setGeneratedReport(result);
        } catch (err) {
            setGeneratedReport({ error: err.message });
        } finally {
            setIsGenerating(false);
        }
    };

    const prioriteColors = {
        critique: 'bg-red-500/20 text-red-400',
        haute: 'bg-orange-500/20 text-orange-400',
        normale: 'bg-blue-500/20 text-blue-400',
        basse: 'bg-green-500/20 text-green-400',
    };

    return (
        <div className={`min-h-screen transition-colors duration-300 ${theme.bg}`}>
            {/* Header */}
            <header className={`sticky top-0 z-50 border-b backdrop-blur-xl ${isDarkMode ? 'border-white/10 bg-[#020617]/80' : 'border-slate-200 bg-white/80'}`}>
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={onBack} className={`p-2 rounded-xl border transition-all ${isDarkMode ? 'bg-white/5 border-white/10 text-slate-400 hover:text-white' : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900'}`}>
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
                                <Brain className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className={`text-lg font-bold ${theme.text}`}>Assistant Medical</h1>
                                <p className={`text-xs ${theme.textSec}`}>Powered by Gemini AI</p>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2 rounded-xl border transition-all ${isDarkMode ? 'bg-white/5 border-white/10 text-slate-400' : 'bg-white border-slate-200 text-slate-500'}`}>
                        {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                </div>

                {/* Tabs */}
                <div className="max-w-7xl mx-auto px-6 pb-3 flex gap-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                activeTab === tab.id ? theme.tabActive : theme.tabInactive
                            }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-6">
                <AnimatePresence mode="wait">
                    {/* ===== TAB 1: CHAT IA ===== */}
                    {activeTab === 'chat' && (
                        <motion.div key="chat" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                            <div className={`rounded-2xl border overflow-hidden flex flex-col ${theme.card}`} style={{ height: 'calc(100vh - 220px)' }}>
                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                    {messages.length === 0 && (
                                        <div className="flex flex-col items-center justify-center h-full gap-6">
                                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
                                                <Brain className="w-10 h-10 text-white" />
                                            </div>
                                            <div className="text-center">
                                                <h3 className={`text-xl font-bold mb-2 ${theme.text}`}>Interrogez votre base de donnees</h3>
                                                <p className={`text-sm ${theme.textSec}`}>Posez une question en francais, l'IA generera le SQL</p>
                                            </div>
                                            <div className="flex flex-wrap gap-2 justify-center">
                                                {exampleQuestions.map((q, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => { setChatInput(q); }}
                                                        className={`px-4 py-2 rounded-full text-sm border transition-all ${isDarkMode ? 'border-white/10 text-slate-300 hover:bg-white/5' : 'border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                                                    >
                                                        {q}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {messages.map((msg, i) => (
                                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${msg.role === 'user' ? theme.userBubble : theme.aiBubble}`}>
                                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                                {msg.sql && (
                                                    <SqlDetail sql={msg.sql} results={msg.results} isDark={isDarkMode} />
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {isQuerying && (
                                        <div className="flex justify-start">
                                            <div className={`rounded-2xl px-5 py-3 ${theme.aiBubble}`}>
                                                <div className="flex items-center gap-2">
                                                    <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
                                                    <span className={`text-sm ${theme.textSec}`}>Analyse en cours...</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input */}
                                <div className={`p-4 border-t ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
                                    <div className="flex gap-3">
                                        <input
                                            type="text"
                                            value={chatInput}
                                            onChange={(e) => setChatInput(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                                            placeholder="Posez une question sur vos donnees..."
                                            className={`flex-1 px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 ${theme.input}`}
                                        />
                                        <button
                                            onClick={handleSendChat}
                                            disabled={isQuerying || !chatInput.trim()}
                                            className="px-4 py-3 rounded-xl bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50 transition-all"
                                        >
                                            <Send className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ===== TAB 2: TRANSCRIPTIONS ===== */}
                    {activeTab === 'transcriptions' && (
                        <motion.div key="transcriptions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* List */}
                                <div className="lg:col-span-2 space-y-4">
                                    {/* Filters */}
                                    <div className={`flex flex-wrap gap-3 p-4 rounded-xl border ${theme.card}`}>
                                        <select
                                            value={transFilters.type_session || ''}
                                            onChange={(e) => setTransFilters(f => ({ ...f, type_session: e.target.value || undefined }))}
                                            className={`px-3 py-2 rounded-lg border text-sm ${theme.input}`}
                                        >
                                            <option value="">Type session</option>
                                            <option value="consultation">Consultation</option>
                                            <option value="urgence">Urgence</option>
                                            <option value="suivi">Suivi</option>
                                            <option value="autre">Autre</option>
                                        </select>
                                        <select
                                            value={transFilters.priorite || ''}
                                            onChange={(e) => setTransFilters(f => ({ ...f, priorite: e.target.value || undefined }))}
                                            className={`px-3 py-2 rounded-lg border text-sm ${theme.input}`}
                                        >
                                            <option value="">Priorite</option>
                                            <option value="critique">Critique</option>
                                            <option value="haute">Haute</option>
                                            <option value="normale">Normale</option>
                                            <option value="basse">Basse</option>
                                        </select>
                                        <button
                                            onClick={loadTranscriptions}
                                            className={`p-2 rounded-lg border transition-all ${isDarkMode ? 'border-white/10 text-slate-400 hover:text-white' : 'border-slate-200 text-slate-500 hover:text-slate-900'}`}
                                        >
                                            <RefreshCw className={`w-4 h-4 ${loadingTrans ? 'animate-spin' : ''}`} />
                                        </button>
                                    </div>

                                    {/* Transcription list */}
                                    {loadingTrans ? (
                                        <div className="flex justify-center py-12">
                                            <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
                                        </div>
                                    ) : transcriptions.length === 0 ? (
                                        <div className={`text-center py-12 rounded-xl border ${theme.card}`}>
                                            <ClipboardList className={`w-12 h-12 mx-auto mb-3 ${theme.textSec}`} />
                                            <p className={theme.textSec}>Aucune transcription trouvee</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {transcriptions.map((tr) => (
                                                <div
                                                    key={tr.id}
                                                    onClick={() => setSelectedTranscription(tr)}
                                                    className={`p-4 rounded-xl border cursor-pointer transition-all ${theme.card} ${theme.cardHover} ${
                                                        selectedTranscription?.id === tr.id ? 'ring-2 ring-violet-500' : ''
                                                    }`}
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="flex-1 min-w-0">
                                                            <p className={`text-sm font-medium truncate ${theme.text}`}>
                                                                {tr.text?.substring(0, 100)}...
                                                            </p>
                                                            <div className="flex items-center gap-2 mt-2">
                                                                <span className={`text-xs ${theme.textSec}`}>
                                                                    {new Date(tr.created_at).toLocaleDateString('fr-FR')}
                                                                </span>
                                                                {tr.type_session && (
                                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${theme.badge}`}>
                                                                        {tr.type_session}
                                                                    </span>
                                                                )}
                                                                {tr.priorite && (
                                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${prioriteColors[tr.priorite] || theme.badge}`}>
                                                                        {tr.priorite}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {tr.analysee ? (
                                                            <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
                                                        ) : (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleAnalyze(tr.id); }}
                                                                disabled={isAnalyzing}
                                                                className="px-3 py-1 text-xs rounded-lg bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50 shrink-0"
                                                            >
                                                                {isAnalyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Analyser'}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Detail panel */}
                                <div className={`p-5 rounded-xl border sticky top-40 ${theme.card}`} style={{ maxHeight: 'calc(100vh - 240px)', overflowY: 'auto' }}>
                                    {selectedTranscription ? (
                                        <div className="space-y-4">
                                            <h3 className={`font-bold ${theme.text}`}>Detail</h3>
                                            {selectedTranscription.resume_ia && (
                                                <div>
                                                    <h4 className={`text-xs font-bold uppercase tracking-wider mb-1 ${theme.textSec}`}>Resume IA</h4>
                                                    <p className={`text-sm ${theme.text}`}>{selectedTranscription.resume_ia}</p>
                                                </div>
                                            )}
                                            {selectedTranscription.points_cles?.length > 0 && (
                                                <div>
                                                    <h4 className={`text-xs font-bold uppercase tracking-wider mb-1 ${theme.textSec}`}>Points cles</h4>
                                                    <ul className="space-y-1">
                                                        {selectedTranscription.points_cles.map((p, i) => (
                                                            <li key={i} className={`text-sm flex items-start gap-2 ${theme.text}`}>
                                                                <span className="text-violet-400 mt-1">•</span> {p}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            {selectedTranscription.entites_detectees && (
                                                <div>
                                                    <h4 className={`text-xs font-bold uppercase tracking-wider mb-1 ${theme.textSec}`}>Entites detectees</h4>
                                                    {Object.entries(selectedTranscription.entites_detectees).map(([key, values]) => (
                                                        values?.length > 0 && (
                                                            <div key={key} className="mb-2">
                                                                <span className={`text-xs font-medium capitalize ${theme.textSec}`}>{key}:</span>
                                                                <div className="flex flex-wrap gap-1 mt-1">
                                                                    {values.map((v, i) => (
                                                                        <span key={i} className={`text-xs px-2 py-0.5 rounded-full ${theme.badge}`}>{v}</span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )
                                                    ))}
                                                </div>
                                            )}
                                            {!selectedTranscription.analysee && !selectedTranscription.resume_ia && (
                                                <div className="text-center py-6">
                                                    <p className={`text-sm mb-3 ${theme.textSec}`}>Pas encore analysee</p>
                                                    <button
                                                        onClick={() => handleAnalyze(selectedTranscription.id)}
                                                        disabled={isAnalyzing}
                                                        className="px-4 py-2 rounded-lg bg-violet-600 text-white text-sm hover:bg-violet-700 disabled:opacity-50"
                                                    >
                                                        {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Analyser avec Gemini'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className={`text-center py-12 ${theme.textSec}`}>
                                            <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                            <p className="text-sm">Selectionnez une transcription</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ===== TAB 3: RAPPORTS ===== */}
                    {activeTab === 'reports' && (
                        <motion.div key="reports" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Config */}
                                <div className={`p-6 rounded-xl border space-y-4 ${theme.card}`}>
                                    <h3 className={`text-lg font-bold flex items-center gap-2 ${theme.text}`}>
                                        <FileText className="w-5 h-5 text-violet-500" />
                                        Generer un rapport
                                    </h3>

                                    <div>
                                        <label className={`text-sm font-medium block mb-1 ${theme.textSec}`}>ID Patient</label>
                                        <input
                                            type="number"
                                            value={patientId}
                                            onChange={(e) => setPatientId(e.target.value)}
                                            placeholder="Ex: 1"
                                            className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 ${theme.input}`}
                                        />
                                    </div>

                                    <div>
                                        <label className={`text-sm font-medium block mb-1 ${theme.textSec}`}>Type de rapport</label>
                                        <select
                                            value={reportType}
                                            onChange={(e) => setReportType(e.target.value)}
                                            className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 ${theme.input}`}
                                        >
                                            <option value="medical">Rapport medical complet</option>
                                            <option value="summary">Resume</option>
                                            <option value="chronological">Chronologique</option>
                                        </select>
                                    </div>

                                    <button
                                        onClick={handleGenerateReport}
                                        disabled={isGenerating || !patientId}
                                        className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 text-white font-medium text-sm hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                                    >
                                        {isGenerating ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                L'IA analyse les donnees du dossier...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-4 h-4" />
                                                Generer le rapport
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* Preview */}
                                <div className={`p-6 rounded-xl border ${theme.card}`} style={{ maxHeight: 'calc(100vh - 240px)', overflowY: 'auto' }}>
                                    {generatedReport ? (
                                        generatedReport.error ? (
                                            <div className="flex items-center gap-3 text-red-400">
                                                <AlertCircle className="w-5 h-5" />
                                                <p className="text-sm">{generatedReport.error}</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <h3 className={`font-bold ${theme.text}`}>
                                                        Rapport - Patient #{generatedReport.patient_id}
                                                    </h3>
                                                    <span className={`text-xs ${theme.textSec}`}>
                                                        {generatedReport.consultation_count} consultations, {generatedReport.transcription_count} transcriptions
                                                    </span>
                                                </div>
                                                <div className={`prose prose-sm max-w-none ${isDarkMode ? 'prose-invert' : ''}`}>
                                                    <pre className={`whitespace-pre-wrap text-sm font-sans ${theme.text}`}>
                                                        {generatedReport.content}
                                                    </pre>
                                                </div>
                                                <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-yellow-50 border-yellow-200'}`}>
                                                    <p className="text-xs text-yellow-500 flex items-center gap-2">
                                                        <AlertCircle className="w-4 h-4" />
                                                        Ces recommandations doivent etre validees par le medecin.
                                                    </p>
                                                </div>
                                            </div>
                                        )
                                    ) : (
                                        <div className={`text-center py-12 ${theme.textSec}`}>
                                            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                            <p className="text-sm">Le rapport genere apparaitra ici</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}


// ===== Sub-component: SQL Detail =====
function SqlDetail({ sql, results, isDark }) {
    const [open, setOpen] = useState(false);

    if (!sql) return null;

    return (
        <div className="mt-3">
            <button
                onClick={() => setOpen(!open)}
                className={`flex items-center gap-1 text-xs ${isDark ? 'text-violet-400' : 'text-violet-600'}`}
            >
                <Database className="w-3 h-3" />
                Voir la requete SQL
                {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            {open && (
                <div className={`mt-2 p-3 rounded-lg text-xs font-mono overflow-x-auto ${isDark ? 'bg-black/30' : 'bg-slate-100'}`}>
                    <pre>{sql}</pre>
                    {results?.rows?.length > 0 && (
                        <div className="mt-3">
                            <p className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                {results.row_count} resultat(s)
                            </p>
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr>
                                            {results.columns?.map((col, i) => (
                                                <th key={i} className={`px-2 py-1 text-left font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{col}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {results.rows.slice(0, 10).map((row, i) => (
                                            <tr key={i} className={i % 2 === 0 ? (isDark ? 'bg-white/5' : 'bg-slate-50') : ''}>
                                                {results.columns?.map((col, j) => (
                                                    <td key={j} className={`px-2 py-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                                        {String(row[col] ?? '')}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
