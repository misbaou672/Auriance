/**
 * Auriance Voice SDK — React Hook
 * Drop-in hook for any React app. Wraps createVoiceRecognizer.
 *
 * Usage:
 *   import { useVoiceRecognizer } from '@auriance/voice-sdk/react';
 *
 *   function MyComponent() {
 *     const { isListening, transcript, start, stop, clear, error } = useVoiceRecognizer({
 *       lang: 'fr-FR',
 *       autoRestart: true,
 *       punctuation: true,
 *     });
 *     return <button onClick={isListening ? stop : start}>{isListening ? 'Stop' : 'Start'}</button>;
 *   }
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { createVoiceRecognizer, isWebSpeechSupported } from '../auriance-voice-sdk.js';

export function useVoiceRecognizer(options = {}) {
    const [state, setState] = useState('idle');
    const [transcript, setTranscript] = useState({ final: '', interim: '', fullText: '' });
    const [error, setError] = useState(null);
    const recognizerRef = useRef(null);
    const optionsRef = useRef(options);
    optionsRef.current = options;

    useEffect(() => {
        const rec = createVoiceRecognizer(optionsRef.current);
        rec.onResult((data) => setTranscript(data));
        rec.onError((err) => setError(err));
        rec.onStateChange(({ state: s }) => setState(s));
        recognizerRef.current = rec;

        return () => {
            rec.destroy();
            recognizerRef.current = null;
        };
    }, [options.lang]);

    const start = useCallback((resetText = true) => {
        setError(null);
        if (resetText) setTranscript({ final: '', interim: '', fullText: '' });
        return recognizerRef.current?.start(resetText) ?? false;
    }, []);

    const stop = useCallback(() => {
        recognizerRef.current?.stop();
    }, []);

    const clear = useCallback(() => {
        recognizerRef.current?.clearText();
        setTranscript({ final: '', interim: '', fullText: '' });
    }, []);

    const setLang = useCallback((lang) => {
        recognizerRef.current?.setLang(lang);
    }, []);

    return {
        state,
        transcript,
        error,
        start,
        stop,
        clear,
        setLang,
        isListening: state === 'listening',
        isSupported: isWebSpeechSupported(),
    };
}
