import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, FileText, History, Settings, LogOut, Sparkles, Terminal, Database, GitBranch, Sun, Moon, ChevronRight, ArrowLeft, Brain } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function ToolsMenu({ onSelectTool, onLogout, onBack, user }) {
    const { t } = useLanguage();
    const [isDarkMode, setIsDarkMode] = useState(true);

    const tools = [
        {
            id: 'transcription',
            name: t('dashboard.toolsMenu.transcription.name'),
            icon: Mic,
            color: '#8b5cf6', // Violet
            description: t('dashboard.toolsMenu.transcription.desc'),
            accent: 'violet'
        },
        {
            id: 'autoform',
            name: t('dashboard.toolsMenu.autoform.name'),
            icon: FileText,
            color: '#3b82f6', // Blue
            description: t('dashboard.toolsMenu.autoform.desc'),
            accent: 'blue'
        },
        {
            id: 'history',
            name: t('dashboard.toolsMenu.history.name'),
            icon: History,
            color: '#10b981', // Emerald
            description: t('dashboard.toolsMenu.history.desc'),
            accent: 'emerald'
        },
        {
            id: 'generated_queries',
            name: t('dashboard.toolsMenu.generatedQueries.name'),
            icon: Database,
            color: '#f59e0b', // Amber
            description: t('dashboard.toolsMenu.generatedQueries.desc'),
            accent: 'amber'
        },
        {
            id: 'assistant_medical',
            name: 'Assistant Medical',
            icon: Brain,
            color: '#ec4899', // Pink
            description: 'Interrogez vos donnees, analysez les transcriptions et generez des rapports patients avec l\'IA.',
            accent: 'pink'
        },
        {
            id: 'settings',
            name: t('dashboard.toolsMenu.settings.name'),
            icon: Settings,
            color: '#64748b', // Slate
            description: t('dashboard.toolsMenu.settings.desc'),
            accent: 'slate'
        },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: 'spring', stiffness: 100 }
        }
    };

    return (
        <div className={`min-h-screen transition-colors duration-700 font-sans ${isDarkMode ? 'bg-[#020617] text-white' : 'bg-slate-50 text-slate-900'}`}>
            {/* Background Orbs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className={`absolute -top-24 -left-24 w-96 h-96 rounded-full blur-[120px] opacity-20 transition-colors duration-1000 ${isDarkMode ? 'bg-violet-600' : 'bg-violet-400'}`} />
                <div className={`absolute top-1/2 -right-24 w-80 h-80 rounded-full blur-[100px] opacity-15 transition-colors duration-1000 ${isDarkMode ? 'bg-blue-600' : 'bg-blue-300'}`} />
                <div className={`absolute -bottom-24 left-1/3 w-96 h-96 rounded-full blur-[120px] opacity-10 transition-colors duration-1000 ${isDarkMode ? 'bg-emerald-600' : 'bg-emerald-200'}`} />
            </div>

            {/* Header */}
            <header className={`sticky top-0 z-50 border-b backdrop-blur-xl transition-colors duration-500 ${isDarkMode ? 'bg-black/20 border-white/10' : 'bg-white/70 border-slate-200'}`}>
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        {onBack && (
                            <button
                                onClick={onBack}
                                className={`p-2.5 rounded-xl transition-all duration-300 group border ${isDarkMode ? 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10' : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 shadow-sm'}`}
                                title={t('dashboard.toolsMenu.back')}
                            >
                                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                            </button>
                        )}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                                <span className="font-black text-xl text-white">A</span>
                            </div>
                            <div>
                                <h1 className="text-xl font-black tracking-tighter uppercase">
                                    Auriance <span className="text-xs font-medium tracking-widest text-slate-500 ml-1">v2.0</span>
                                </h1>
                                <p className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                    {t('dashboard.toolsMenu.subtitle')}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex flex-col items-end">
                            <span className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{user?.full_name || user?.username}</span>
                            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">{t('dashboard.toolsMenu.connected')}</span>
                        </div>

                        <div className="flex items-center gap-2 p-1 rounded-full border border-white/10 bg-black/5">
                            <button
                                onClick={() => setIsDarkMode(false)}
                                className={`p-1.5 rounded-full transition-all ${!isDarkMode ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500 hover:text-white'}`}
                            >
                                <Sun className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setIsDarkMode(true)}
                                className={`p-1.5 rounded-full transition-all ${isDarkMode ? 'bg-slate-800 text-yellow-400 shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
                            >
                                <Moon className="w-4 h-4" />
                            </button>
                        </div>

                        <button
                            onClick={onLogout}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isDarkMode ? 'bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white' : 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white'
                                }`}
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">{t('dashboard.toolsMenu.logout')}</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 max-w-7xl mx-auto px-6 py-16 md:py-24">
                <div className="flex flex-col items-center text-center mb-16 space-y-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${isDarkMode ? 'bg-white/5 border-white/10 text-violet-400' : 'bg-violet-50 border-violet-100 text-violet-600'}`}
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                        {t('dashboard.toolsMenu.ecosystemTag')}
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className={`text-4xl md:text-6xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
                    >
                        {t('dashboard.toolsMenu.chooseTitle')} <span className="bg-gradient-to-r from-violet-500 via-blue-500 to-emerald-500 bg-clip-text text-transparent">{t('dashboard.toolsMenu.chooseTitleSuffix')}</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className={`max-w-xl text-lg md:text-xl font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}
                    >
                        {t('dashboard.toolsMenu.chooseSubtitle')}
                    </motion.p>
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {tools.map((tool, idx) => {
                        const Icon = tool.icon;
                        return (
                            <motion.button
                                key={tool.id}
                                variants={itemVariants}
                                whileHover={{ y: -8, scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => onSelectTool(tool.id)}
                                className="group relative text-left"
                            >
                                <div className={`relative h-full p-8 rounded-[2.5rem] border overflow-hidden backdrop-blur-3xl shadow-2xl transition-all duration-500 ${isDarkMode ? 'bg-slate-900/40 border-white/5 hover:border-white/20' : 'bg-white border-slate-200 hover:border-slate-300'
                                    }`}>
                                    {/* Tool Background Glow */}
                                    <div
                                        className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-[60px] opacity-0 group-hover:opacity-40 transition-opacity duration-500"
                                        style={{ backgroundColor: tool.color }}
                                    />

                                    <div className="flex flex-col h-full space-y-6">
                                        <div className="flex items-start justify-between">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-500 group-hover:rotate-6 group-hover:scale-110`}
                                                style={{ backgroundColor: `${tool.color}15`, border: `1px solid ${tool.color}30` }}
                                            >
                                                <Icon className="w-7 h-7" style={{ color: tool.color }} />
                                            </div>
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-slate-500 group-hover:text-white transition-colors duration-500">
                                                <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <h3 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                                {tool.name}
                                            </h3>
                                            <p className={`text-sm leading-relaxed font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                                {tool.description}
                                            </p>
                                        </div>

                                        <div className="pt-4 flex items-center gap-2 mt-auto">
                                            <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest`}
                                                style={{ backgroundColor: `${tool.color}10`, color: tool.color }}
                                            >
                                                {t('dashboard.toolsMenu.optimizedAI')}
                                            </div>
                                            <div className={`w-1.5 h-1.5 rounded-full`} style={{ backgroundColor: tool.color }} />
                                        </div>
                                    </div>
                                </div>
                            </motion.button>
                        );
                    })}

                    {/* Pro Card Placeholder */}
                    <motion.div
                        variants={itemVariants}
                        className={`relative p-1 rounded-[2.6rem] bg-gradient-to-br from-violet-600 via-blue-600 to-emerald-600 opacity-60 hover:opacity-100 transition-opacity cursor-pointer`}
                    >
                        <div className={`h-full p-8 rounded-[2.5rem] flex flex-col items-center justify-center text-center space-y-4 ${isDarkMode ? 'bg-[#020617]' : 'bg-white'}`}>
                            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                                <Sparkles className="w-8 h-8 text-white animate-pulse" />
                            </div>
                            <h3 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{t('dashboard.toolsMenu.proPlus')}</h3>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t('dashboard.toolsMenu.comingSoon')}</p>
                        </div>
                    </motion.div>
                </motion.div>
            </main>

            <footer className={`relative z-10 py-12 border-t mt-12 transition-colors duration-500 ${isDarkMode ? 'border-white/5 text-slate-500' : 'border-slate-100 text-slate-400'}`}>
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] font-bold uppercase tracking-[0.2em]">
                    <div className="flex items-center gap-6">
                        <a href="#" className="hover:text-white transition-colors">{t('dashboard.toolsMenu.footerPrivacy')}</a>
                        <a href="#" className="hover:text-white transition-colors">{t('dashboard.toolsMenu.footerTerms')}</a>
                        <a href="#" className="hover:text-white transition-colors">{t('dashboard.toolsMenu.footerApiStatus')}</a>
                    </div>
                    <p>&copy; 2026 Auriance Intelligence. {t('dashboard.toolsMenu.footerRights')}</p>
                </div>
            </footer>
        </div>
    );
}
