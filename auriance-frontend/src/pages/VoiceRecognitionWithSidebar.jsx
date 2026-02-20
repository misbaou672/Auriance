// src/pages/VoiceRecognitionWithSidebar.jsx
import React, { useState, useRef, useEffect } from 'react';
import AutoFormPage from '../components/AutoFormPage';
import TranscriptionHistory from '../components/TranscriptionHistory';
import ToolsMenu from '../components/ToolsMenu';
import LiveTranscription from './LiveTranscription';
import GeneratedQueriesTool from '../components/GeneratedQueriesTool';
import SettingsPage from './settings/SettingsPage';
import AssistantMedical from './AssistantMedical';

import HistoryPage from './HistoryPage';
import { saveTranscription, exportTranscriptionPdf } from '../services/api';
import { createVoiceRecognizer } from '../../sdk/auriance-voice-sdk.js';

import { useLanguage } from '../contexts/LanguageContext';

export default function VoiceRecognitionWithSidebar({ user, onLogout, onBack }) {
    const { t, currentLanguage } = useLanguage();
    // État pour la navigation entre les vues
    const [currentView, setCurrentView] = useState('menu'); // 'menu' | 'transcription_live' | 'transcription' | 'auto_form' | 'history'

    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const [showModelModal, setShowModelModal] = useState(false);
    const [showToolDropdown, setShowToolDropdown] = useState(false);
    const [showMicDropdown, setShowMicDropdown] = useState(false);
    const [selectedTool, setSelectedTool] = useState('Rapide');
    const [activeTab, setActiveTab] = useState('compte-rendu');
    const [elapsedTime, setElapsedTime] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showSessionHistory, setShowSessionHistory] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [sessions, setSessions] = useState([
        { id: 1, title: 'Session sans titre', time: '9:45PM', date: '19/01/2026' },
        { id: 2, title: 'Session sans titre', time: '9:43PM', date: '19/01/2026' },
        { id: 3, title: 'Fonctionnement session', time: '8:27PM', date: '23/12/2025' },
        { id: 4, title: 'Azee', time: '9:07PM', date: '16/11/2025' },
        { id: 5, title: 'Azee', time: '6:00PM', date: '16/11/2025' },
    ]);

    // Timer effect
    useEffect(() => {
        let interval;
        if (isRecording) {
            interval = setInterval(() => {
                setElapsedTime(prev => prev + 1);
            }, 1000);
        } else {
            setElapsedTime(0);
        }
        return () => clearInterval(interval);
    }, [isRecording]);

    const recognizerRef = useRef(null);

    // Cleanup on unmount
    useEffect(() => {
        return () => recognizerRef.current?.destroy();
    }, []);

    const toggleRecording = () => {
        if (isRecording) {
            recognizerRef.current?.stop();
            setIsRecording(false);
        } else {
            const locale = t('locale') || 'fr-FR';
            if (recognizerRef.current) recognizerRef.current.destroy();
            const rec = createVoiceRecognizer({ lang: locale, autoRestart: true });
            rec.onResult(({ final: f, interim: i }) => {
                setTranscript(f);
                setInterimTranscript(i);
            });
            recognizerRef.current = rec;
            rec.start();
            setIsRecording(true);
        }
    };

    const clearTranscript = () => {
        setTranscript('');
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const createNewSession = () => {
        setTranscript('');
        setElapsedTime(0);
        setIsRecording(false);
        sttService.stop();
    };

    const handleSaveTranscription = async () => {
        if (!transcript || transcript.trim().length === 0) {
            alert('Aucune transcription à sauvegarder');
            return;
        }
        try {
            await saveTranscription(transcript, currentLanguage.toLowerCase(), elapsedTime);
            alert('Transcription sauvegardée avec succès !');
        } catch (error) {
            console.error('Error saving:', error);
            alert('Erreur lors de l\'sauvegarde');
        }
    };

    const handleExportPdf = async () => {
        if (!transcript || transcript.trim().length === 0) {
            alert('Aucune transcription à exporter');
            return;
        }
        try {
            const blob = await exportTranscriptionPdf(transcript, 'Transcription Vocale', currentLanguage.toLowerCase());
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `transcription_${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            alert('PDF téléchargé avec succès dans votre dossier Téléchargements !');
        } catch (error) {
            console.error('Error exporting PDF:', error);
            alert('Erreur lors de l\'export PDF: ' + error.message);
        }
    };

    const models = [
        { name: 'Compte rendu de consultation', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
        { name: 'H & P (Including Issues)', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
        { name: 'Liste de problèmes', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
        { name: 'Médecin généraliste, note clinique', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
        { name: 'Note clinique (format SOAP)', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
        { name: 'Note clinique avec problèmes (format SOAP)', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    ];
    // Gestion de la navigation entre les vues
    const handleSelectTool = (toolId) => {
        if (toolId === 'transcription') {
            setCurrentView('transcription_live');
        } else if (toolId === 'autoform') {
            setCurrentView('auto_form');
        } else if (toolId === 'history') {
            setCurrentView('history');
        } else if (toolId === 'generated_queries') {
            setCurrentView('generated_queries');
        } else if (toolId === 'settings') {
            setCurrentView('settings');
        } else if (toolId === 'assistant_medical') {
            setCurrentView('assistant_medical');
        }
    };


    // Afficher le menu d'outils
    if (currentView === 'menu') {
        return <ToolsMenu onSelectTool={handleSelectTool} onLogout={onLogout} onBack={onBack} user={user} />;
    }

    // Afficher la page de transcription live (nouvelle interface Siri)
    if (currentView === 'transcription_live') {
        return <LiveTranscription onBack={() => setCurrentView('menu')} user={user} />;
    }

    // Afficher l'auto form
    if (currentView === 'auto_form') {
        return (
            <div className="h-screen">
                <AutoFormPage onBack={() => setCurrentView('menu')} user={user} />
            </div>
        );
    }

    // Afficher l'outil de requêtes générées
    if (currentView === 'generated_queries') {
        return <GeneratedQueriesTool onBack={() => setCurrentView('menu')} />;
    }

    // Afficher l'historique
    if (currentView === 'history') {
        return <HistoryPage onBack={() => setCurrentView('menu')} user={user} />;
    }

    // Afficher l'assistant medical
    if (currentView === 'assistant_medical') {
        return <AssistantMedical onBack={() => setCurrentView('menu')} user={user} />;
    }

    // Afficher les paramètres
    if (currentView === 'settings') {
        // On passe une fausse fonction de déconnexion si on veut juste revenir au menu, 
        // ou la vraie onLogout si on veut vraiment se déconnecter depuis les settings.
        // Ici, on va passer onBack pour revenir au menu ET onLogout pour la vraie déconnexion.
        // Mais SettingsPage attend onLogout. 
        // -> Modifions SettingsPage pour accepter onBack ? Non, on va wrapper.
        return (
            <div className="relative">
                <button
                    onClick={() => setCurrentView('menu')}
                    className="fixed top-6 left-6 z-50 p-2 bg-white/10 hover:bg-white/20 rounded-full text-slate-500 hover:text-slate-900 transition-colors"
                >
                    <span className="sr-only">Retour</span>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                </button>
                <SettingsPage currentUser={user} onLogout={onLogout} />
            </div>
        );
    }

    // Ancienne interface (pour compatibilité)
    return (
        <div className="flex h-screen bg-heidi-bg overflow-hidden">
            {/* Sidebar */}
            <div className="w-56 bg-heidi-beige flex flex-col border-r border-heidi-border">
                {/* User Profile */}
                <div className="p-3 border-b border-heidi-border flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-800 text-white flex items-center justify-center text-xs font-semibold">
                        {user ? (user.full_name || user.username).substring(0, 2).toUpperCase() : 'A9'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-heidi-text truncate">
                            {user ? (user.full_name || user.username) : 'Utilisateur'}
                        </p>
                        <p className="text-xs text-heidi-dark truncate">
                            {user ? user.email : 'Non connecté'}
                        </p>
                    </div>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="text-heidi-dark hover:text-heidi-dark"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                    </button>
                </div>

                {/* Menu Items */}
                <nav className="flex-1 overflow-y-auto py-2">
                    <button
                        onClick={createNewSession}
                        className="w-full px-3 py-2 text-left text-xs text-white bg-heidi-brown hover:bg-heidi-dark rounded mx-2 flex items-center justify-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Nouvelle session</span>
                    </button>
                    <button
                        onClick={() => {
                            setShowSessionHistory(!showSessionHistory);
                            setCurrentView('transcription');
                            setShowHistory(false);
                        }}
                        className={`w-full px-3 py-2 text-left text-xs text-heidi-text hover:bg-heidi-hover flex items-center gap-2 mt-2 ${currentView === 'transcription' && !showHistory ? 'bg-heidi-hover' : ''}`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                        <span>Outil de transcription</span>
                        <svg className="w-3 h-3 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                    <button
                        onClick={() => {
                            setCurrentView('transcription');
                            setShowHistory(true);
                        }}
                        className={`w-full px-3 py-2 text-left text-xs text-heidi-text hover:bg-heidi-hover flex items-center gap-2 ${showHistory ? 'bg-heidi-hover' : ''}`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Historique</span>
                    </button>
                    <button className="w-full px-3 py-2 text-left text-xs text-heidi-text hover:bg-heidi-hover flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                        <span>Tâches</span>
                    </button>

                    <button
                        onClick={() => setCurrentView('auto_form')}
                        className={`w-full px-3 py-2 text-left text-xs text-heidi-text hover:bg-heidi-hover flex items-center gap-2 ${currentView === 'auto_form' ? 'bg-heidi-hover' : ''}`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Auto Formulaire</span>
                    </button>

                    <div className="my-2 px-3">
                        <p className="text-xs font-semibold text-heidi-dark mb-1">Modèles</p>
                    </div>

                    <button className="w-full px-3 py-2 text-left text-xs text-heidi-text hover:bg-heidi-hover flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <span>Bibliothèque de modèles</span>
                    </button>
                    <button className="w-full px-3 py-2 text-left text-xs text-heidi-text hover:bg-heidi-hover flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span>Communauté</span>
                    </button>
                    <button className="w-full px-3 py-2 text-left text-xs text-heidi-text hover:bg-heidi-hover flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span>Équipe</span>
                    </button>
                    <button className="w-full px-3 py-2 text-left text-xs text-heidi-text hover:bg-heidi-hover flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>Paramètres</span>
                    </button>
                </nav>

                {/* Bottom Section */}
                <div className="border-t border-heidi-border p-2 space-y-1">
                    <button className="w-full px-2 py-1.5 text-left text-xs text-heidi-text hover:bg-heidi-hover rounded flex items-center gap-2">
                        <span>💰</span>
                        <span>Gagnez 50 $</span>
                    </button>
                    <button className="w-full px-2 py-1.5 text-left text-xs text-heidi-text hover:bg-heidi-hover rounded flex items-center gap-2">
                        <span>💡</span>
                        <span>Suggestions</span>
                    </button>
                    <button className="w-full px-2 py-1.5 text-left text-xs text-heidi-text hover:bg-heidi-hover rounded flex items-center gap-2">
                        <span>⌨️</span>
                        <span>Raccourcis</span>
                        <span className="ml-auto text-xs text-heidi-dark">S</span>
                    </button>
                    <button className="w-full px-2 py-1.5 text-left text-xs text-heidi-text hover:bg-heidi-hover rounded flex items-center gap-2">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Aide</span>
                    </button>
                    <button className="w-full px-2 py-1.5 text-xs bg-heidi-brown text-white hover:bg-heidi-dark rounded font-medium text-center">
                        Programmer une démo
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden bg-heidi-bg">
                {/* Top Bar */}
                <div className="bg-heidi-bg border-b border-heidi-border px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-heidi-bg border border-heidi-border rounded text-xs hover:bg-heidi-beige">
                            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span>Ajouter les données patient</span>
                            <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </button>
                        <div className="flex items-center gap-1.5 text-xs text-heidi-dark">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>Aujourd'hui {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <button className="flex items-center gap-1.5 px-2 py-1 bg-heidi-bg border border-heidi-border rounded text-xs hover:bg-heidi-beige">
                            <span>🇫🇷</span>
                            <span>français</span>
                        </button>
                        <button className="px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 flex items-center gap-1.5">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                            </svg>
                            <span>Mettre à niveau maintenant</span>
                        </button>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-xs text-heidi-dark">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{formatTime(elapsedTime)}</span>
                        </div>
                        <div className="relative">
                            <button
                                onClick={toggleRecording}
                                className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 ${isRecording
                                    ? 'bg-red-500 text-white'
                                    : 'bg-green-600 text-white hover:bg-green-700'
                                    }`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                </svg>
                                <span>Transcription</span>
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                                <span className="ml-1">•••••</span>
                            </button>
                        </div>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-heidi-bg border border-heidi-border rounded text-xs hover:bg-heidi-beige">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            <span>Par défaut - Réseau...</span>
                            <span>•••••</span>
                        </button>
                    </div>
                </div>

                {currentView === 'auto_form' ? (
                    <AutoForm />
                ) : showHistory ? (
                    <TranscriptionHistory onClose={() => setShowHistory(false)} />
                ) : (
                    <>
                        {/* Tabs */}
                        <div className="bg-heidi-bg border-b border-heidi-border px-4 flex gap-4">
                            <button
                                onClick={() => setActiveTab('contexte')}
                                className={`px-3 py-2 text-xs font-medium flex items-center gap-1.5 ${activeTab === 'contexte'
                                    ? 'text-heidi-text border-b-2 border-gray-900'
                                    : 'text-heidi-dark hover:text-heidi-text'
                                    }`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span>Contexte</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('note')}
                                className={`px-3 py-2 text-xs font-medium flex items-center gap-1.5 ${activeTab === 'note'
                                    ? 'text-heidi-text border-b-2 border-gray-900'
                                    : 'text-heidi-dark hover:text-heidi-text'
                                    }`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                <span>Note</span>
                            </button>
                        </div>

                        {/* Main Content with Tasks Sidebar */}
                        <div className="flex-1 flex overflow-hidden">
                            {/* Left Content - Consultation Report */}
                            <div className="flex-1 overflow-y-auto p-6">
                                <div className="max-w-4xl mx-auto">
                                    {/* Model Selection */}
                                    <div className="mb-6 flex items-center gap-2">
                                        <button
                                            onClick={() => setShowModelModal(true)}
                                            className="px-3 py-1.5 bg-heidi-bg border border-heidi-border rounded text-xs hover:bg-heidi-beige flex items-center gap-1.5"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <span>Sélectionner un modèle</span>
                                        </button>
                                        <div className="relative">
                                            <button
                                                onClick={() => setShowToolDropdown(!showToolDropdown)}
                                                className="px-3 py-1.5 bg-heidi-bg border border-heidi-border rounded text-xs hover:bg-heidi-beige flex items-center gap-1.5"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                                <span>{selectedTool}</span>
                                            </button>
                                            {showToolDropdown && (
                                                <div className="absolute top-full left-0 mt-1 bg-heidi-bg border border-heidi-border rounded-lg shadow-lg p-2 z-10 w-64">
                                                    <button
                                                        onClick={() => { setSelectedTool('Rapide'); setShowToolDropdown(false); }}
                                                        className="w-full px-3 py-2 text-left text-xs hover:bg-heidi-beige rounded flex items-center gap-2"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                        </svg>
                                                        <div>
                                                            <div className="font-medium">Rapide</div>
                                                            <div className="text-heidi-dark">Pour les sessions simples</div>
                                                        </div>
                                                    </button>
                                                    <button
                                                        onClick={() => { setSelectedTool('Avancé'); setShowToolDropdown(false); }}
                                                        className="w-full px-3 py-2 text-left text-xs hover:bg-heidi-beige rounded flex items-center gap-2"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                        <div>
                                                            <div className="font-medium">Avancé</div>
                                                            <div className="text-heidi-dark">Pour les sessions complexes</div>
                                                        </div>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <button className="px-2 py-1.5 bg-heidi-bg border border-heidi-border rounded text-xs hover:bg-heidi-beige">
                                            <span>⋯</span>
                                        </button>
                                    </div>

                                    {/* Central Message or Transcript */}
                                    {!transcript ? (
                                        <div className="text-center py-12">
                                            <div className="flex justify-end mb-6 pr-12">
                                                <svg className="w-16 h-16 transform rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                                </svg>
                                            </div>
                                            <h2 className="text-base font-normal text-gray-800 mb-2">
                                                Pour commencer cette session, utilisez le bouton en haut à droite.
                                            </h2>
                                            <p className="text-sm text-heidi-dark mb-8">
                                                Votre note apparaîtra ici une fois votre session terminée.
                                            </p>

                                            {/* Transcription Options */}
                                            <div className="inline-block">
                                                <button
                                                    onClick={toggleRecording}
                                                    className={`px-4 py-2 rounded text-sm font-medium flex items-center gap-2 mx-auto ${isRecording
                                                        ? 'bg-red-500 text-white hover:bg-red-600'
                                                        : 'bg-green-600 text-white hover:bg-green-700'
                                                        }`}
                                                >
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                    <span>{isRecording ? 'Arrêter la transcription' : 'Lancer la transcription'}</span>
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </button>

                                                {/* Dropdown Options */}
                                                <div className="mt-3 bg-heidi-bg border border-heidi-border rounded-lg p-3 shadow-sm text-left max-w-xs mx-auto">
                                                    <div className="space-y-1.5 text-xs">
                                                        <label className="flex items-center gap-2 cursor-pointer hover:bg-heidi-beige p-1.5 rounded">
                                                            <input type="checkbox" defaultChecked className="rounded text-green-500" />
                                                            <span>Transcription</span>
                                                            <svg className="w-4 h-4 ml-auto text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        </label>
                                                        <label className="flex items-center gap-2 cursor-pointer hover:bg-heidi-beige p-1.5 rounded">
                                                            <input type="checkbox" className="rounded" />
                                                            <span>Dictée</span>
                                                        </label>
                                                        <label className="flex items-center gap-2 cursor-pointer hover:bg-heidi-beige p-1.5 rounded">
                                                            <input type="checkbox" className="rounded" />
                                                            <span>Changer l'audio de la session</span>
                                                        </label>
                                                    </div>
                                                    <div className="mt-2 pt-2 border-t border-heidi-border">
                                                        <p className="text-xs text-red-500 flex items-start gap-1">
                                                            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                            </svg>
                                                            <span>Sélectionnez votre mode de consultation dans le menu déroulant</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-heidi-bg rounded-lg border border-heidi-border p-6 min-h-[400px]">
                                            <h2 className="text-base font-semibold text-heidi-text mb-4">
                                                Compte rendu de consultation :
                                            </h2>
                                            <div className="text-sm text-heidi-dark mb-4">
                                                {new Date().toLocaleDateString('fr-FR')}
                                            </div>
                                            <div className="space-y-4">
                                                <p className="text-sm text-heidi-text leading-relaxed whitespace-pre-wrap">
                                                    {transcript}
                                                    <span className="text-gray-400">{interimTranscript}</span>
                                                </p>
                                            </div>

                                            {/* Save and PDF Buttons */}
                                            <div className="mt-6 flex gap-3 justify-end border-t border-heidi-border pt-4">
                                                <button
                                                    onClick={handleSaveTranscription}
                                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 font-medium text-sm"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                                    </svg>
                                                    💾 Sauvegarder
                                                </button>
                                                <button
                                                    onClick={handleExportPdf}
                                                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-2 font-medium text-sm"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                    </svg>
                                                    📄 Exporter PDF
                                                </button>
                                            </div>

                                            <div className="mt-4 flex items-center gap-2">
                                                <button className="p-2 hover:bg-heidi-hover rounded">
                                                    <svg className="w-4 h-4 text-heidi-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                                    </svg>
                                                </button>
                                                <button className="p-2 hover:bg-heidi-hover rounded">
                                                    <svg className="w-4 h-4 text-heidi-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={clearTranscript}
                                                    className="ml-auto px-4 py-2 bg-heidi-beige-dark hover:bg-heidi-hover text-heidi-text rounded text-sm"
                                                >
                                                    Effacer
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Sidebar - Tasks */}
                            <div className="w-80 bg-heidi-beige border-l border-heidi-border p-4 overflow-y-auto">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-semibold text-heidi-text flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                        </svg>
                                        <span>Tâches</span>
                                    </h3>
                                    <button className="text-heidi-dark hover:text-heidi-dark">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="text-center py-12">
                                    <div className="mb-4">
                                        <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <p className="text-sm text-heidi-dark mb-4">Aucune tâche créée</p>
                                    <button className="px-4 py-2 bg-heidi-bg border border-heidi-border rounded text-sm hover:bg-heidi-beige flex items-center gap-2 mx-auto">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        <span>Créer une tâche</span>
                                    </button>
                                </div>

                                <div className="mt-auto pt-4 border-t border-heidi-border">
                                    <p className="text-xs text-heidi-dark">
                                        Les tâches clôturées seront archivées dans 30 jours
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Input Area */}
                        <div className="bg-heidi-bg border-t border-heidi-border p-3">
                            <div className="max-w-5xl mx-auto">
                                <div className="flex items-center gap-2 mb-2">
                                    <button className="p-1.5 hover:bg-heidi-hover rounded">
                                        <svg className="w-5 h-5 text-heidi-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                        </svg>
                                    </button>
                                    <input
                                        type="text"
                                        placeholder="Demandez à Auriance d'effectuer une action..."
                                        className="flex-1 px-3 py-2 border border-heidi-border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                    <button className="p-1.5 hover:bg-heidi-hover rounded">
                                        <svg className="w-5 h-5 text-heidi-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                        </svg>
                                    </button>
                                    <button className="p-1.5 hover:bg-heidi-hover rounded">
                                        <svg className="w-5 h-5 text-heidi-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                        </svg>
                                    </button>
                                    <button className="px-3 py-2 bg-heidi-beige-dark hover:bg-heidi-hover rounded">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <p className="flex items-center gap-1 text-orange-600">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        <span>Vérifiez votre note avant de l'utiliser pour vous assurer qu'elle restitue fidèlement la consultation.</span>
                                    </p>
                                    <div className="flex items-center gap-2 text-heidi-dark">
                                        <span>Didacticiels</span>
                                        <span>28%</span>
                                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Floating Buttons */}
                        <div className="fixed bottom-20 right-6 flex flex-col gap-2">
                            <button className="w-10 h-10 bg-gray-800 hover:bg-heidi-dark text-white rounded-full shadow-lg flex items-center justify-center">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                            </button>
                            <button className="w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </button>
                        </div>
                    </>
                )
                }
            </div >

            {/* Model Selection Modal */}
            {
                showModelModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-heidi-bg rounded-lg shadow-xl w-full max-w-md p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">Modèles de notes</h3>
                                <button
                                    onClick={() => setShowModelModal(false)}
                                    className="text-heidi-dark hover:text-heidi-dark"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <input
                                type="text"
                                placeholder="Recherchez ou générez ce que vous voulez"
                                className="w-full px-3 py-2 border border-heidi-border rounded mb-4 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {models.map((model, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setShowModelModal(false)}
                                        className="w-full px-3 py-2 text-left text-sm hover:bg-heidi-beige rounded flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={model.icon} />
                                        </svg>
                                        <span>{model.name}</span>
                                    </button>
                                ))}
                            </div>
                            <div className="mt-4 pt-4 border-t border-heidi-border">
                                <button className="w-full px-4 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 flex items-center justify-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    <span>Créer un modèle</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Notifications Panel */}
            {
                showNotifications && (
                    <div className="fixed top-0 right-0 w-96 h-screen bg-heidi-bg border-l border-heidi-border shadow-xl z-50 overflow-y-auto">
                        <div className="p-4 border-b border-heidi-border flex items-center justify-between">
                            <h3 className="text-base font-semibold">Notifications</h3>
                            <div className="flex items-center gap-2">
                                <button className="text-heidi-dark hover:text-heidi-dark">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => setShowNotifications(false)}
                                    className="text-heidi-dark hover:text-heidi-dark"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div className="p-4 space-y-2">
                            <button className="w-full px-3 py-2 text-left text-sm text-heidi-text hover:bg-heidi-beige rounded flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Tout marquer comme lu</span>
                            </button>
                            <button className="w-full px-3 py-2 text-left text-sm text-red-500 hover:bg-red-50 rounded flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                <span>Supprimer tous les lus</span>
                            </button>
                            <button className="w-full px-3 py-2 text-left text-sm text-red-500 hover:bg-red-50 rounded flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                <span>Tout supprimer</span>
                            </button>
                            <button className="w-full px-3 py-2 text-left text-sm text-heidi-text hover:bg-heidi-beige rounded flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span>Paramètres</span>
                            </button>
                        </div>
                        <div className="p-8 text-center">
                            <div className="mb-4">
                                <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h4 className="text-base font-semibold text-heidi-text mb-2">Rien à voir ici</h4>
                            <p className="text-sm text-heidi-dark">
                                Vous ne recevrez plus de notifications et pourrez vous concentrer sur vos patients.
                            </p>
                        </div>
                    </div>
                )
            }

            {/* Session History Panel */}
            {
                showSessionHistory && (
                    <div className="fixed top-0 right-0 w-96 h-screen bg-heidi-bg border-l border-heidi-border shadow-xl z-50 overflow-y-auto">
                        <div className="p-4 border-b border-heidi-border flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <button className="text-heidi-dark hover:text-heidi-dark">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                                    </svg>
                                </button>
                                <button className="text-heidi-dark hover:text-heidi-dark">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                    </svg>
                                </button>
                                <button className="text-heidi-dark hover:text-heidi-dark">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </button>
                                <button className="text-heidi-dark hover:text-heidi-dark">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                </button>
                            </div>
                            <button
                                onClick={() => setShowSessionHistory(false)}
                                className="text-heidi-dark hover:text-heidi-dark"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="border-b border-heidi-border flex">
                            <button className="flex-1 px-4 py-2 text-sm font-medium text-heidi-dark hover:text-heidi-text">
                                À venir
                            </button>
                            <button className="flex-1 px-4 py-2 text-sm font-medium text-heidi-text border-b-2 border-gray-900">
                                Passées
                            </button>
                        </div>
                        <div className="p-4 space-y-4">
                            {sessions.map((session, index) => {
                                const showDate = index === 0 || sessions[index - 1].date !== session.date;
                                return (
                                    <div key={session.id}>
                                        {showDate && (
                                            <div className="text-xs font-semibold text-heidi-dark mb-2">{session.date}</div>
                                        )}
                                        <button className="w-full p-3 bg-heidi-beige hover:bg-heidi-hover rounded flex items-center gap-3 text-left">
                                            <div className="w-8 h-8 rounded-full bg-heidi-beige-dark flex items-center justify-center flex-shrink-0">
                                                <svg className="w-4 h-4 text-heidi-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                                </svg>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-heidi-text truncate">{session.title}</p>
                                                <p className="text-xs text-heidi-dark">{session.time}</p>
                                            </div>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="p-4 border-t border-heidi-border">
                            <button className="w-full px-4 py-2 bg-heidi-bg border border-heidi-border rounded text-sm hover:bg-heidi-beige flex items-center justify-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                                </svg>
                                <span>Organiser</span>
                            </button>
                        </div>
                    </div>
                )
            }
        </div >
    );
}