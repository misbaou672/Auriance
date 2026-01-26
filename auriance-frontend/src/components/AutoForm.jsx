import React, { useState, useEffect, useRef } from 'react';
import {
    FileText,
    Wand2,
    Download,
    Copy,
    Check,
    Edit3,
    Save,
    Sparkles,
    AlertCircle,
    Printer,
    Send,
    History,
    Plus,
    Mic
} from 'lucide-react';
import { generateFormJson, saveConsultation, saveTranscription, exportTranscriptionPdf, API_BASE_URL } from '../services/api';

const templates = [
    { id: 1, name: 'Consultation générale', fields: 12 },
    { id: 2, name: 'Ordonnance', fields: 8 },
    { id: 3, name: 'Certificat médical', fields: 6 },
    { id: 4, name: 'Compte-rendu hospitalier', fields: 15 },
    { id: 5, name: 'Bilan sanguin', fields: 20 },
];

function VoiceWave({ isActive = false, barCount = 24, className = '' }) {
    const bars = Array.from({ length: barCount }, (_, i) => i);
    return (
        <div className={`flex items-end justify-center gap-1 ${className}`}>
            {bars.map((i) => (
                <span
                    key={i}
                    className={`w-1 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-emerald-200'} `}
                    style={{ height: 10 + (i % 7) * 4, animationDelay: `${i * 40}ms` }}
                />
            ))}
        </div>
    );
}

export default function AutoForm({ user, onBack }) {
    // States for form data and STT error
    const [formData, setFormData] = useState({ nom: '', age: '', temperature: '', symptomes: '', diagnostic: '', traitement: '' });
    const [sttError, setSttError] = useState('');
    // ...existing hooks and refs...

    // Example fallback UI if STT is not available
    const sttAvailable = window.SpeechRecognition || window.webkitSpeechRecognition;

    return (
        <div className="flex flex-col items-center justify-center h-full p-8 bg-gray-50">
            <div className="w-full max-w-lg bg-white rounded shadow p-6">
                <h2 className="text-2xl font-bold mb-4">Auto-Remplissage du Formulaire</h2>
                {!sttAvailable && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        <span>La reconnaissance vocale n'est pas disponible sur ce navigateur.</span>
                    </div>
                )}
                {sttError && (
                    <div className="mb-4 p-3 bg-yellow-100 text-yellow-700 rounded flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        <span>Erreur STT : {sttError}</span>
                    </div>
                )}
                <form className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Nom</label>
                        <input type="text" className="w-full border rounded p-2" value={formData.nom} readOnly />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Âge</label>
                        <input type="text" className="w-full border rounded p-2" value={formData.age} readOnly />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Température</label>
                        <input type="text" className="w-full border rounded p-2" value={formData.temperature} readOnly />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Symptômes</label>
                        <textarea className="w-full border rounded p-2" value={formData.symptomes} readOnly />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Diagnostic</label>
                        <textarea className="w-full border rounded p-2" value={formData.diagnostic} readOnly />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Traitement</label>
                        <textarea className="w-full border rounded p-2" value={formData.traitement} readOnly />
                    </div>
                </form>
                <button className="mt-6 px-4 py-2 bg-emerald-500 text-white rounded" onClick={onBack}>Retour</button>
            </div>
        </div>
    );
}

// ...existing code...

// ...existing code...

// ...existing code...

// ...existing code...

// ...existing code...

// ...existing code...

// ...existing code...

// ...existing code...

const flushQueue = async () => {
    if (isSendingRef.current) return;
    isSendingRef.current = true;
    try {
        while (chunkQueueRef.current.length > 0) {
            const blob = chunkQueueRef.current.shift();
            if (!blob || blob.size === 0) continue;
            try {
                await transcribeBlob(blob, { append: true });
            } catch (error) {
                console.error('Erreur transcription:', error);
            }
        }
    } finally {
        isSendingRef.current = false;
    }
};

const startMediaRecorderFallback = async () => {
    if (!window.isSecureContext) {
        setSttError('secure_context_required');
        return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
        setSttError('micro_unavailable');
        return;
    }
    if (typeof MediaRecorder === 'undefined') {
        setSttError('mediarecorder_unsupported');
        return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioChunksRef.current = [];
    const preferredTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/mpeg'
    ];
    const mimeType = preferredTypes.find(t => MediaRecorder.isTypeSupported(t));
    const mediaRecorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
            audioChunksRef.current.push(event.data);
            chunkQueueRef.current.push(event.data);
            flushQueue();
        }
    };

    mediaRecorder.onstop = async () => {
        isProcessingRef.current = true;
        await flushQueue();
        try {
            const blobType = mediaRecorder.mimeType || 'audio/webm';
            const fullBlob = new Blob(audioChunksRef.current, { type: blobType });
            await transcribeBlob(fullBlob, { append: false });
        } catch (error) {
            console.error('Erreur transcription finale:', error);
        }
        isProcessingRef.current = false;
    };

    mediaRecorder.start(2000);
    setIsRecording(true);
};

const toggleRecording = async () => {
    if (isRecording) {
        recognitionRef.current?.stop?.();
        mediaRecorderRef.current?.stop?.();
        mediaRecorderRef.current?.stream?.getTracks?.().forEach(track => track.stop());
        setIsRecording(false);
        setInterim('');
        setTimeout(() => handleExtraction(transcriptRef.current), 500);
        return;
    }

    if (isProcessingRef.current) return;

    setSttError('');
    const hasPermission = await ensureMicroPermission();
    if (!hasPermission) return;
    if (startWatchdogRef.current) clearTimeout(startWatchdogRef.current);
    const recognition = recognitionRef.current || initSpeechRecognition();
    if (recognition) {
        recognitionRef.current = recognition;
        try {
            recognition.start();
            setIsRecording(true);
            startWatchdogRef.current = setTimeout(async () => {
                if (!isRecordingRef.current) return;
                const hasText = transcriptRef.current.trim() || interimRef.current.trim();
                if (!hasText) {
                    try {
                        recognitionRef.current?.stop?.();
                    } catch { }
                    await startMediaRecorderFallback();
                }
            }, 3000);
            return;
        } catch (error) {
            console.error('Erreur STT web:', error);
            setSttError('start_failed');
        }
    }

    try {
        await startMediaRecorderFallback();
    } catch (error) {
        console.error('Erreur micro:', error);
    }
};

const handleExtraction = async (text, { allowBackend = false } = {}) => {
    const textToProcess = text || transcript;
    const normalized = normalizeDictationText(textToProcess);
    if (!normalized || normalized.length < 5) return;
    if (normalized === lastExtractedTextRef.current) return;
    lastExtractedTextRef.current = normalized;

    const local = localExtractFormFields(normalized);
    setFormData(prev => {
        const localPrenom = (local.prenom || '').trim();
        const localNom = (local.nom || '').trim();
        const localFullName = [localPrenom, localNom].filter(Boolean).join(' ').trim();
        return {
            ...prev,
            nom: localFullName || prev.nom,
            age: local.age || prev.age,
            temperature: local.temperature || prev.temperature,
            symptomes: mergeListText(prev.symptomes, local.symptomes || ''),
            diagnostic: mergeListText(prev.diagnostic, local.diagnostic || ''),
            traitement: mergeListText(prev.traitement, local.traitement || ''),
        };
    });
};

const applyLocalPreviewFill = (rawText) => {
    const normalized = normalizeDictationText(rawText);
    if (!normalized) return;
    const local = localExtractFormFields(normalized);
    setFormData(prev => {
        const localPrenom = (local.prenom || '').trim();
        const localNom = (local.nom || '').trim();
        const localFullName = [localPrenom, localNom].filter(Boolean).join(' ').trim();
        return {
            ...prev,
            nom: localFullName || prev.nom,
            age: local.age || prev.age,
            temperature: local.temperature || prev.temperature,
            symptomes: mergeListText(prev.symptomes, local.symptomes || ''),
            diagnostic: mergeListText(prev.diagnostic, local.diagnostic || ''),
            traitement: mergeListText(prev.traitement, local.traitement || ''),
        };
    });
};

const initSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        setSttAvailable(false);
        return null;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'fr-FR';
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
        let interimText = '';
        let finalText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const text = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalText += text + ' ';
            } else {
                interimText += text;
            }
        }
        if (finalText) {
            const next = (transcriptRef.current ? `${transcriptRef.current} ${finalText}` : finalText).trim();
            updateTranscript(next, { append: false });
            applyLocalPreviewFill(next); // Extraction locale immédiate
            handleExtraction(next); // Extraction locale uniquement
        }
        setInterim(interimText.trim());
        interimRef.current = interimText.trim();
    };

    recognition.onerror = (event) => {
        const msg = event?.error || 'unknown_error';
        setSttError(msg);
        if (msg === 'not-allowed' || msg === 'audio-capture') {
            setIsRecording(false);
            return;
        }
        if (isRecordingRef.current && (msg === 'no-speech' || msg === 'aborted')) {
            try {
                recognition.stop();
                setTimeout(() => {
                    try { recognition.start(); } catch { }
                }, 300);
            } catch { }
        }
    };

    recognition.onend = () => {
        if (isRecordingRef.current) {
            try {
                recognition.start();
            } catch { }
        }
    };

    return recognition;
};

const transcribeBlob = async (blob, { append = true } = {}) => {
    if (!blob || blob.size === 0) return;
    const formData = new FormData();
    formData.append('audio_file', blob, 'recording.webm');
    formData.append('language', 'fr');
}
