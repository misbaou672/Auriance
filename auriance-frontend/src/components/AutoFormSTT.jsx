import React, { useState, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

// Extraction locale simple (à adapter selon ton NLP)
function extractFieldsFromText(text) {
    // Exemples très simples, à remplacer par ton extraction NLP
    const nomMatch = text.match(/nom\s*[:\-]?\s*([\w\s]+)/i);
    const ageMatch = text.match(/\b(\d{1,3})\s*ans?\b/);
    const symptomesMatch = text.match(/sympt[oô]mes?\s*[:\-]?\s*([\w\s,]+)/i);
    const diagnosticMatch = text.match(/diagnostic\s*[:\-]?\s*([\w\s,]+)/i);
    const traitementMatch = text.match(/traitement\s*[:\-]?\s*([\w\s,]+)/i);
    const tempMatch = text.match(/temp[ée]rature\s*[:\-]?\s*(\d{2}(?:[\.,]\d)?)/i);
    return {
        nom: nomMatch ? nomMatch[1].trim() : '',
        age: ageMatch ? ageMatch[1] : '',
        symptomes: symptomesMatch ? symptomesMatch[1].trim() : '',
        diagnostic: diagnosticMatch ? diagnosticMatch[1].trim() : '',
        traitement: traitementMatch ? traitementMatch[1].trim() : '',
        temperature: tempMatch ? tempMatch[1].replace(',', '.') : '',
    };
}

export default function AutoFormSTT() {
    const { t } = useLanguage();
    const [fields, setFields] = useState({
        nom: '',
        age: '',
        symptomes: '',
        diagnostic: '',
        traitement: '',
        temperature: '',
    });
    const [listening, setListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const recognitionRef = useRef(null);

    const handleStart = () => {
        if (!('webkitSpeechRecognition' in window)) {
            alert('La reconnaissance vocale n\'est pas supportée sur ce navigateur.');
            return;
        }
        const recognition = new window.webkitSpeechRecognition();
        recognition.lang = t('locale') || 'fr-FR';
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.onresult = (event) => {
            let fullText = '';
            for (let i = 0; i < event.results.length; ++i) {
                fullText += event.results[i][0].transcript;
            }
            setTranscript(fullText);
            const extracted = extractFieldsFromText(fullText);
            setFields((prev) => ({ ...prev, ...extracted }));
        };
        recognition.onend = () => setListening(false);
        recognitionRef.current = recognition;
        recognition.start();
        setListening(true);
    };

    const handleStop = () => {
        recognitionRef.current && recognitionRef.current.stop();
        setListening(false);
    };

    return (
        <div className="max-w-xl mx-auto p-6 bg-white rounded shadow">
            <h2 className="text-2xl font-bold mb-4">Formulaire médical auto-rempli (Voix)</h2>
            <div className="mb-4 flex gap-2">
                <button onClick={listening ? handleStop : handleStart} className={`px-4 py-2 rounded ${listening ? 'bg-red-500' : 'bg-blue-500'} text-white`}>
                    {listening ? 'Arrêter' : 'Dicter'}
                </button>
                <span className="text-gray-500">{listening ? 'Écoute en cours...' : 'Appuyez pour dicter'}</span>
            </div>
            <div className="mb-4">
                <label className="block text-gray-700">Transcription en direct :</label>
                <div className="p-2 bg-gray-100 rounded min-h-[40px]">{transcript}</div>
            </div>
            <form className="space-y-3">
                <div>
                    <label>Nom</label>
                    <input className="w-full border rounded p-2" value={fields.nom} onChange={e => setFields(f => ({ ...f, nom: e.target.value }))} />
                </div>
                <div>
                    <label>Âge</label>
                    <input className="w-full border rounded p-2" value={fields.age} onChange={e => setFields(f => ({ ...f, age: e.target.value }))} />
                </div>
                <div>
                    <label>Symptômes</label>
                    <input className="w-full border rounded p-2" value={fields.symptomes} onChange={e => setFields(f => ({ ...f, symptomes: e.target.value }))} />
                </div>
                <div>
                    <label>Diagnostic</label>
                    <input className="w-full border rounded p-2" value={fields.diagnostic} onChange={e => setFields(f => ({ ...f, diagnostic: e.target.value }))} />
                </div>
                <div>
                    <label>Traitement</label>
                    <input className="w-full border rounded p-2" value={fields.traitement} onChange={e => setFields(f => ({ ...f, traitement: e.target.value }))} />
                </div>
                <div>
                    <label>Température</label>
                    <input className="w-full border rounded p-2" value={fields.temperature} onChange={e => setFields(f => ({ ...f, temperature: e.target.value }))} />
                </div>
            </form>
        </div>
    );
}
