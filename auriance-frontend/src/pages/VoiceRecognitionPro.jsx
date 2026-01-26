// src/pages/VoiceRecognitionPro.jsx
import React, { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../services/api';

export default function VoiceRecognitionPro() {
    const [activeTab, setActiveTab] = useState('compte-rendu');
    const [transcription, setTranscription] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [documents, setDocuments] = useState([]);
    const [reports, setReports] = useState([]);
    const recognitionRef = useRef(null);

    // Initialiser Web Speech API
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'fr-FR';

            recognitionRef.current.onresult = (event) => {
                let interimTranscript = '';
                let finalTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript + ' ';
                    } else {
                        interimTranscript += transcript;
                    }
                }

                setTranscription(prev => prev + finalTranscript);
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Erreur reconnaissance vocale:', event.error);
                setIsRecording(false);
            };
        }

        // Charger l'historique
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

            // Charger transcriptions
            const transResponse = await fetch(`${API_BASE_URL}/data/transcriptions?limit=10`, { headers });
            if (transResponse.ok) {
                const data = await transResponse.json();
                setDocuments(data.transcriptions || []);
            }

            // Charger rapports
            const reportsResponse = await fetch(`${API_BASE_URL}/data/reports?limit=10`, { headers });
            if (reportsResponse.ok) {
                const data = await reportsResponse.json();
                setReports(data.reports || []);
            }
        } catch (error) {
            console.error('Erreur chargement historique:', error);
        }
    };

    const toggleRecording = () => {
        if (isRecording) {
            recognitionRef.current?.stop();
            setIsRecording(false);
        } else {
            recognitionRef.current?.start();
            setIsRecording(true);
        }
    };

    const generateDocument = async () => {
        if (!transcription.trim()) {
            alert('Aucune transcription à générer');
            return;
        }

        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${API_BASE_URL}/data/reports`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify({
                    title: `Rapport ${new Date().toLocaleDateString('fr-FR')}`,
                    content: transcription,
                    report_type: 'consultation'
                })
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `rapport_${Date.now()}.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);

                alert('Document généré avec succès !');
                loadHistory();
            } else {
                alert('Erreur lors de la génération du document');
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de la génération du document');
        }
    };

    const saveTranscription = async () => {
        if (!transcription.trim()) return;

        try {
            const token = localStorage.getItem('access_token');
            await fetch(`${API_BASE_URL}/data/transcriptions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify({
                    text: transcription,
                    language: 'fr',
                    duration: 0
                })
            });
            loadHistory();
        } catch (error) {
            console.error('Erreur sauvegarde:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
            <div className="max-w-5xl mx-auto">
                {/* Header avec indicateur En direct */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Auriance - Interface Professionnelle
                    </h1>
                    {isRecording && (
                        <div className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-full animate-pulse">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                            <span className="font-semibold">En direct ✓</span>
                        </div>
                    )}
                </div>

                {/* Carte principale */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Onglets */}
                    <div className="border-b border-gray-200">
                        <div className="flex space-x-8 px-6">
                            <button
                                onClick={() => setActiveTab('compte-rendu')}
                                className={`py-4 px-2 font-semibold transition-colors relative ${activeTab === 'compte-rendu'
                                    ? 'text-blue-600'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Compte-rendu
                                {activeTab === 'compte-rendu' && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab('document')}
                                className={`py-4 px-2 font-semibold transition-colors relative ${activeTab === 'document'
                                    ? 'text-blue-600'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Document
                                {activeTab === 'document' && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab('rapport')}
                                className={`py-4 px-2 font-semibold transition-colors relative ${activeTab === 'rapport'
                                    ? 'text-blue-600'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Rapport
                                {activeTab === 'rapport' && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Contenu des onglets */}
                    <div className="p-8">
                        {activeTab === 'compte-rendu' && (
                            <div>
                                {/* Header avec badge Standard */}
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-gray-900">
                                        Transcription en temps réel
                                    </h2>
                                    <span className="bg-blue-100 text-blue-800 px-4 py-1 rounded-full text-sm font-semibold">
                                        Standard
                                    </span>
                                </div>

                                {/* Zone de transcription */}
                                <div className="mb-6">
                                    {isEditing ? (
                                        <textarea
                                            value={transcription}
                                            onChange={(e) => setTranscription(e.target.value)}
                                            className="w-full h-64 p-4 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 leading-relaxed"
                                            placeholder="Commencez à parler..."
                                        />
                                    ) : (
                                        <div className="w-full min-h-[16rem] p-6 bg-gray-50 rounded-lg border border-gray-200">
                                            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                                                {transcription || "Cliquez sur le microphone pour commencer l'enregistrement..."}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Bouton Microphone (si pas en mode édition) */}
                                {!isEditing && (
                                    <div className="flex justify-center mb-6">
                                        <button
                                            onClick={toggleRecording}
                                            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all transform hover:scale-110 ${isRecording
                                                ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                                                : 'bg-blue-600 hover:bg-blue-700'
                                                }`}
                                        >
                                            {isRecording ? (
                                                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <rect x="6" y="6" width="8" height="8" rx="1" />
                                                </svg>
                                            ) : (
                                                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                )}

                                {/* Boutons d'action */}
                                <div className="flex space-x-4">
                                    <button
                                        onClick={generateDocument}
                                        disabled={!transcription.trim()}
                                        className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                                    >
                                        Générer le document
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsEditing(!isEditing);
                                            if (isEditing) saveTranscription();
                                        }}
                                        className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                                    >
                                        {isEditing ? 'Sauvegarder' : 'Modifier'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'document' && (
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 mb-6">
                                    Documents générés
                                </h2>
                                {documents.length > 0 ? (
                                    <div className="space-y-4">
                                        {documents.map((doc, index) => (
                                            <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-gray-900">
                                                            Document {index + 1}
                                                        </h3>
                                                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                                            {doc.text?.substring(0, 100)}...
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-2">
                                                            {new Date(doc.created_at).toLocaleDateString('fr-FR')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-center py-8">
                                        Aucun document pour le moment
                                    </p>
                                )}
                            </div>
                        )}

                        {activeTab === 'rapport' && (
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 mb-6">
                                    Rapports générés
                                </h2>
                                {reports.length > 0 ? (
                                    <div className="space-y-4">
                                        {reports.map((report, index) => (
                                            <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-gray-900">
                                                            {report.title || `Rapport ${index + 1}`}
                                                        </h3>
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            Type: {report.report_type || 'consultation'}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-2">
                                                            {new Date(report.created_at).toLocaleDateString('fr-FR')}
                                                        </p>
                                                    </div>
                                                    <button className="text-blue-600 hover:text-blue-800 font-semibold text-sm">
                                                        Télécharger
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-center py-8">
                                        Aucun rapport pour le moment
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
