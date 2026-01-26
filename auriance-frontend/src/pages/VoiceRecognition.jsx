import React, { useState, useRef, useEffect } from 'react';
import { API_BASE_URL } from '../services/api';

const VoiceRecognition = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState('auto');
    const [serverStatus, setServerStatus] = useState('checking');
    const [showTranscriptOptions, setShowTranscriptOptions] = useState(true);

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    // Vérifier le statut du serveur
    const checkServerStatus = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/voice/health`);
            if (response.ok) {
                setServerStatus('connected');
            } else {
                setServerStatus('error');
            }
        } catch (error) {
            setServerStatus('error');
            console.error('Serveur non connecté:', error);
        }
    };

    useEffect(() => {
        checkServerStatus();
    }, []);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm;codecs=opus'
            });

            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = processRecording;

            mediaRecorder.start(1000);
            setIsRecording(true);
            setTranscript('🎤 Enregistrement en cours...');

        } catch (error) {
            console.error('Erreur accès micro:', error);
            setTranscript('❌ Erreur: Accès au micro refusé');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);
            setTranscript('⚡ Traitement en cours...');
        }
    };

    const processRecording = async () => {
        setIsProcessing(true);

        try {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

            const formData = new FormData();
            formData.append('audio_file', audioBlob, 'recording.webm');
            if (selectedLanguage !== 'auto') {
                formData.append('language', selectedLanguage);
            }

            const response = await fetch(`${API_BASE_URL}/api/voice/transcribe`, {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (result?.success && result?.transcription?.text) {
                const text = result.transcription.text.trim();
                const lang = result.transcription.language || 'auto';
                setTranscript(`✅ Transcription réussie (langue: ${lang})\n\n📝 ${text}`);
            } else {
                const errorMessage = result?.error || result?.detail || 'Erreur inconnue';
                setTranscript(`❌ Erreur: ${errorMessage}`);
            }

        } catch (error) {
            console.error('Erreur transcription:', error);
            setTranscript('❌ Erreur de connexion au serveur');
        } finally {
            setIsProcessing(false);
        }
    };

    const clearTranscript = () => {
        setTranscript('');
    };

    return (
        <div className="flex h-screen bg-white overflow-hidden">
            {/* Sidebar */}
            <div className="w-56 bg-[#f5f1e8] flex flex-col border-r border-gray-200">
                {/* User Profile */}
                <div className="p-3 border-b border-gray-200 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-800 text-white flex items-center justify-center text-xs font-semibold">
                        A9
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 truncate">Azee 95</p>
                        <p className="text-xs text-gray-500 truncate">azee95@gmail...</p>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                    </button>
                </div>

                {/* Menu Items */}
                <nav className="flex-1 overflow-y-auto py-2">
                    <button className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-[#e8dfc8] flex items-center gap-2">
                        <span className="text-sm">📝</span>
                        <span>Nouvelle session</span>
                    </button>
                    <button className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-[#e8dfc8] flex items-center gap-2">
                        <span className="text-sm">🎙️</span>
                        <span>Outil de transcription</span>
                    </button>
                    <button className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-[#e8dfc8] flex items-center gap-2">
                        <span className="text-sm">✓</span>
                        <span>Tâches</span>
                    </button>

                    <div className="my-2 px-3">
                        <p className="text-xs font-semibold text-gray-500 mb-1">Modèles</p>
                    </div>

                    <button className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-[#e8dfc8] flex items-center gap-2">
                        <span className="text-sm">📚</span>
                        <span>Bibliothèque de modèles</span>
                    </button>
                    <button className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-[#e8dfc8] flex items-center gap-2">
                        <span className="text-sm">👥</span>
                        <span>Communauté</span>
                    </button>
                    <button className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-[#e8dfc8] flex items-center gap-2">
                        <span className="text-sm">👨‍👩‍👧‍👦</span>
                        <span>Équipe</span>
                    </button>
                    <button className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-[#e8dfc8] flex items-center gap-2">
                        <span className="text-sm">⚙️</span>
                        <span>Paramètres</span>
                    </button>
                </nav>

                {/* Bottom Section */}
                <div className="border-t border-gray-200 p-2 space-y-1">
                    <button className="w-full px-2 py-1.5 text-left text-xs text-gray-700 hover:bg-[#e8dfc8] rounded flex items-center gap-2">
                        <span>💰</span>
                        <span>Crédits 50 $</span>
                    </button>
                    <button className="w-full px-2 py-1.5 text-left text-xs text-gray-700 hover:bg-[#e8dfc8] rounded flex items-center gap-2">
                        <span>💡</span>
                        <span>Suggestions</span>
                    </button>
                    <button className="w-full px-2 py-1.5 text-left text-xs text-gray-700 hover:bg-[#e8dfc8] rounded flex items-center gap-2">
                        <span>⌨️</span>
                        <span>Raccourcis</span>
                        <span className="ml-auto text-xs text-gray-400">S</span>
                    </button>
                    <button className="w-full px-2 py-1.5 text-left text-xs text-gray-700 hover:bg-[#e8dfc8] rounded flex items-center gap-2">
                        <span>❓</span>
                        <span>Aide</span>
                    </button>
                    <button className="w-full px-2 py-1.5 text-xs bg-[#2e1d00] text-white hover:bg-[#4a3219] rounded font-medium text-center">
                        Programmer une démo
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden bg-white">
                {/* Top Bar */}
                <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded text-xs hover:bg-gray-50">
                            <span className="text-red-500 text-sm">⊕</span>
                            <span>Ajouter les données patient</span>
                            <span className="text-red-500 text-xs">⚠️</span>
                        </button>
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <span>📅</span>
                            <span>Aujourd'hui 08:27PM</span>
                        </div>
                        <button className="flex items-center gap-1.5 px-2 py-1 bg-white border border-gray-300 rounded text-xs hover:bg-gray-50">
                            <span>🇫🇷</span>
                            <span>français</span>
                        </button>
                        <button className="px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 flex items-center gap-1.5">
                            <span>↗</span>
                            <span>Mettre à niveau maintenant</span>
                        </button>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <span>⏱️</span>
                            <span>00:00</span>
                        </div>
                        <button
                            onClick={isRecording ? stopRecording : startRecording}
                            disabled={isProcessing || serverStatus !== 'connected'}
                            className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 ${isRecording
                                ? 'bg-red-500 text-white'
                                : 'bg-green-500 text-white hover:bg-green-600'
                                } disabled:bg-gray-400 disabled:cursor-not-allowed`}
                        >
                            <span>🎙️</span>
                            <span>Transcription</span>
                            <span className="text-white">▼</span>
                            <span className="ml-1">•••••</span>
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white border-b border-gray-200 px-4 flex gap-4">
                    <button className="px-3 py-2 text-xs font-medium text-gray-900 border-b-2 border-gray-900 flex items-center gap-1.5">
                        <span>📋</span>
                        <span>Contextes</span>
                    </button>
                    <button className="px-3 py-2 text-xs font-medium text-gray-500 hover:text-gray-700 flex items-center gap-1.5">
                        <span>✏️</span>
                        <span>Note</span>
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto bg-white p-6">
                    <div className="max-w-3xl mx-auto">
                        {/* Model Selection */}
                        <div className="mb-6 flex items-center gap-2">
                            <button className="px-3 py-1.5 bg-white border border-gray-300 rounded text-xs hover:bg-gray-50 flex items-center gap-1.5">
                                <span>📋</span>
                                <span>Sélectionner un modèle</span>
                            </button>
                            <button className="px-3 py-1.5 bg-white border border-gray-300 rounded text-xs hover:bg-gray-50 flex items-center gap-1.5">
                                <span>✏️</span>
                                <span>Intermédiaire</span>
                            </button>
                            <button className="px-2 py-1.5 bg-white border border-gray-300 rounded text-xs hover:bg-gray-50">
                                <span>⋯</span>
                            </button>
                        </div>

                        {/* Central Message */}
                        {!transcript && (
                            <div className="text-center py-12">
                                <div className="flex justify-end mb-6 pr-12">
                                    <div className="text-5xl transform rotate-45">
                                        ↗
                                    </div>
                                </div>
                                <h2 className="text-base font-normal text-gray-800 mb-2">
                                    Pour commencer cette session, utilisez le bouton en haut à droite.
                                </h2>
                                <p className="text-sm text-gray-600 mb-8">
                                    Votre note apparaîtra ici une fois votre session terminée.
                                </p>

                                {/* Transcription Button with Options */}
                                {showTranscriptOptions && (
                                    <div className="inline-block">
                                        <button
                                            onClick={isRecording ? stopRecording : startRecording}
                                            disabled={isProcessing || serverStatus !== 'connected'}
                                            className={`px-4 py-2 rounded text-sm font-medium flex items-center gap-2 mx-auto ${isRecording
                                                ? 'bg-red-500 text-white hover:bg-red-600'
                                                : 'bg-green-500 text-white hover:bg-green-600'
                                                } disabled:bg-gray-400 disabled:cursor-not-allowed`}
                                        >
                                            <span>✓</span>
                                            <span>{isRecording ? 'Arrêter la transcription' : 'Lancer la transcription'}</span>
                                            <span>✓</span>
                                        </button>

                                        {/* Dropdown Options */}
                                        <div className="mt-3 bg-white border border-gray-200 rounded-lg p-3 shadow-sm text-left max-w-xs mx-auto">
                                            <div className="space-y-1.5 text-xs">
                                                <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1.5 rounded">
                                                    <input type="checkbox" defaultChecked className="rounded text-green-500" />
                                                    <span>Transcription</span>
                                                    <span className="ml-auto text-green-500">✓</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1.5 rounded">
                                                    <input type="checkbox" className="rounded" />
                                                    <span>Dictée</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1.5 rounded">
                                                    <input type="checkbox" className="rounded" />
                                                    <span>Changer l'audio de la session</span>
                                                </label>
                                            </div>
                                            <div className="mt-2 pt-2 border-t border-gray-200">
                                                <p className="text-xs text-red-500 flex items-start gap-1">
                                                    <span>⚠️</span>
                                                    <span>Sélectionnez votre mode de consultation dans le menu déroulant</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Transcript Display */}
                        {transcript && (
                            <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-sm text-gray-800">Transcription</h3>
                                    <button
                                        onClick={clearTranscript}
                                        className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-xs"
                                    >
                                        Effacer
                                    </button>
                                </div>
                                <div className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed">
                                    {transcript}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Input Area */}
                <div className="bg-white border-t border-gray-200 p-3">
                    <div className="max-w-3xl mx-auto">
                        <div className="flex items-center gap-2 mb-2">
                            <button className="p-1.5 hover:bg-gray-100 rounded">
                                <span className="text-lg">🤖</span>
                            </button>
                            <input
                                type="text"
                                placeholder="Demandez à Heidi d'effectuer une action..."
                                className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <button className="p-1.5 hover:bg-gray-100 rounded">
                                <span className="text-lg">🎤</span>
                            </button>
                            <button className="p-1.5 hover:bg-gray-100 rounded">
                                <span className="text-lg">📎</span>
                            </button>
                            <button className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded">
                                <span>⬆️</span>
                            </button>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <p className="flex items-center gap-1 text-orange-600">
                                <span>⚠️</span>
                                <span>Vérifiez votre note avant de l'utiliser pour vous assurer qu'elle restitue fidèlement la consultation.</span>
                            </p>
                            <div className="flex items-center gap-2 text-gray-500">
                                <span>Didacticiels</span>
                                <span>28%</span>
                                <span className="text-green-500">🔄</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Floating Buttons */}
                <div className="fixed bottom-20 right-6 flex flex-col gap-2">
                    <button className="w-10 h-10 bg-gray-800 hover:bg-gray-700 text-white rounded-full shadow-lg flex items-center justify-center">
                        <span className="text-sm">💬</span>
                    </button>
                    <button className="w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center">
                        <span className="text-sm">🎯</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VoiceRecognition;