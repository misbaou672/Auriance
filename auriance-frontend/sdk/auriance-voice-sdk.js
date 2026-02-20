/**
 * Auriance Voice SDK
 * Framework-agnostic voice recognition library wrapping Web Speech API.
 * Zero dependencies. Single file. ES module.
 *
 * Usage:
 *   import { createVoiceRecognizer, isWebSpeechSupported } from './sdk/auriance-voice-sdk.js';
 *
 *   const rec = createVoiceRecognizer({ lang: 'fr-FR', autoRestart: true, punctuation: true });
 *   rec.onResult(({ final, interim, fullText }) => console.log(fullText));
 *   rec.onError(({ error, message }) => console.error(message));
 *   rec.onStateChange(({ state }) => console.log('State:', state));
 *   rec.start();
 *   // later...
 *   rec.stop();
 *   rec.destroy();
 */

// ── French punctuation voice commands ──────────────────────────────────────────

export const FRENCH_PUNCTUATION_RULES = [
    { pattern: /\bvirgule\b/gi, replacement: ',' },
    { pattern: /\bpoint d'exclamation\b/gi, replacement: '!' },
    { pattern: /\bpoint d'interrogation\b/gi, replacement: '?' },
    { pattern: /\bpoint\b(?!\s+(d'exclamation|d'interrogation))/gi, replacement: '.' },
    { pattern: /\bdeux points\b/gi, replacement: ':' },
    { pattern: /\bpoint virgule\b/gi, replacement: ';' },
    { pattern: /\bpoints de suspension\b/gi, replacement: '...' },
    { pattern: /\bouvrir la parenthèse\b/gi, replacement: '(' },
    { pattern: /\bouvre parenthèse\b/gi, replacement: '(' },
    { pattern: /\bparenthèse ouvrante\b/gi, replacement: '(' },
    { pattern: /\bfermer la parenthèse\b/gi, replacement: ')' },
    { pattern: /\bferme parenthèse\b/gi, replacement: ')' },
    { pattern: /\bparenthèse fermante\b/gi, replacement: ')' },
    { pattern: /\bà la ligne\b/gi, replacement: '\n' },
    { pattern: /\ba la ligne\b/gi, replacement: '\n' },
    { pattern: /\bnouvelle ligne\b/gi, replacement: '\n' },
    { pattern: /\bretour à la ligne\b/gi, replacement: '\n' },
    { pattern: /\bretour a la ligne\b/gi, replacement: '\n' },
    { pattern: /\bsaut de ligne\b/gi, replacement: '\n' },
];

// ── Browser support check ──────────────────────────────────────────────────────

export function isWebSpeechSupported() {
    return typeof window !== 'undefined' &&
        ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
}

// ── Error descriptions ─────────────────────────────────────────────────────────

const ERROR_MAP = {
    'not-allowed': 'Microphone access denied',
    'service-not-allowed': 'Speech service not allowed',
    'no-speech': 'No speech detected',
    'audio-capture': 'No microphone found',
    'aborted': 'Recognition aborted',
    'network': 'Network error',
};

// ── Factory ────────────────────────────────────────────────────────────────────

/**
 * @param {Object} options
 * @param {string}  [options.lang='fr-FR']           BCP 47 tag, or '' for auto-detect
 * @param {boolean} [options.continuous=true]          Keep listening after pauses
 * @param {boolean} [options.interimResults=true]      Emit partial results
 * @param {number}  [options.maxAlternatives=1]        Number of alternatives
 * @param {boolean} [options.autoRestart=false]        Auto-restart on unexpected end
 * @param {number}  [options.restartDebounceMs=500]    Min ms between restarts
 * @param {boolean} [options.punctuation=false]        Convert voice cmds to punctuation
 * @param {Array}   [options.punctuationRules=null]    Custom rules array
 * @returns {Object} VoiceRecognizer instance
 */
export function createVoiceRecognizer(options = {}) {
    const cfg = {
        lang: 'fr-FR',
        continuous: true,
        interimResults: true,
        maxAlternatives: 1,
        autoRestart: false,
        restartDebounceMs: 500,
        punctuation: false,
        punctuationRules: null,
        ...options,
    };

    // ── Internal state ───────────────────────────────────────────────────────
    let state = 'idle'; // idle | listening | restarting | error | destroyed
    let recognition = null;
    let finalText = '';
    let interimText = '';
    let manualStop = false;
    let engineListening = false;
    let restartToken = 0;
    let restartPending = false;
    let lastRestartTime = 0;

    const listeners = { result: [], error: [], stateChange: [] };

    // ── Event emitter ────────────────────────────────────────────────────────
    function emit(evt, data) {
        for (const fn of listeners[evt] || []) {
            try { fn(data); } catch (e) { console.error('[AurianceSDK] listener error:', e); }
        }
    }

    function setState(next, detail = '') {
        if (state === next) return;
        state = next;
        emit('stateChange', { state, detail });
    }

    // ── Punctuation processor ────────────────────────────────────────────────
    function applyPunctuation(text) {
        if (!cfg.punctuation) return text;
        const rules = cfg.punctuationRules || FRENCH_PUNCTUATION_RULES;
        let out = text;
        for (const r of rules) out = out.replace(r.pattern, r.replacement);
        out = out.replace(/\s+([.,!?;:])/g, '$1');
        out = out.replace(/([.,!?;:])\s*/g, '$1 ');
        return out.trim();
    }

    // ── Build SpeechRecognition instance ──────────────────────────────────────
    function buildRecognition() {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) return null;

        const rec = new SR();
        rec.lang = cfg.lang;
        rec.continuous = cfg.continuous;
        rec.interimResults = cfg.interimResults;
        rec.maxAlternatives = cfg.maxAlternatives;

        rec.onstart = () => {
            engineListening = true;
            setState('listening');
        };

        rec.onresult = (event) => {
            let sessionFinal = finalText;
            let sessionInterim = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const raw = event.results[i][0]?.transcript || '';
                const processed = applyPunctuation(raw);

                if (event.results[i].isFinal) {
                    const trimmed = processed.trim();
                    if (trimmed && !sessionFinal.endsWith(trimmed)) {
                        sessionFinal += (sessionFinal ? ' ' : '') + trimmed;
                    }
                } else {
                    sessionInterim += processed;
                }
            }

            finalText = sessionFinal.trim();
            interimText = sessionInterim.trim();
            const fullText = [finalText, interimText].filter(Boolean).join(' ').trim();
            emit('result', { final: finalText, interim: interimText, fullText });
        };

        rec.onerror = (event) => {
            const code = event?.error || 'unknown';
            emit('error', { error: code, message: ERROR_MAP[code] || `Error: ${code}` });

            if (cfg.autoRestart && !manualStop && (code === 'no-speech' || code === 'aborted')) {
                scheduleRestart();
            } else if (code === 'not-allowed' || code === 'service-not-allowed') {
                setState('error', code);
            }
        };

        rec.onend = () => {
            engineListening = false;
            if (!manualStop && cfg.autoRestart && state !== 'destroyed') {
                scheduleRestart();
            } else if (manualStop || !cfg.autoRestart) {
                setState('idle');
            }
        };

        return rec;
    }

    // ── Auto-restart with debounce + token cancellation ──────────────────────
    function scheduleRestart(delay = 100) {
        const now = Date.now();
        if (now - lastRestartTime < cfg.restartDebounceMs) return;
        if (engineListening || restartPending) return;

        lastRestartTime = now;
        const token = ++restartToken;
        restartPending = true;
        setState('restarting');

        setTimeout(() => {
            if (token !== restartToken || state === 'destroyed') {
                restartPending = false;
                return;
            }
            restartPending = false;

            try { recognition?.stop(); } catch (_) { /* noop */ }

            setTimeout(() => {
                if (token !== restartToken || state === 'destroyed') return;
                if (!manualStop && !engineListening) {
                    try {
                        recognition?.start();
                    } catch (e) {
                        emit('error', { error: 'restart-failed', message: e.message });
                        setState('idle');
                    }
                }
            }, 50);
        }, delay);
    }

    // ── Public API ───────────────────────────────────────────────────────────

    function start(resetText = true) {
        if (state === 'destroyed') throw new Error('[AurianceSDK] Cannot start a destroyed recognizer');

        recognition = recognition || buildRecognition();
        if (!recognition) {
            emit('error', { error: 'unsupported', message: 'Web Speech API not supported' });
            return false;
        }

        manualStop = false;
        if (resetText) { finalText = ''; interimText = ''; }

        try { recognition.stop(); } catch (_) { /* noop */ }
        try {
            recognition.start();
            return true;
        } catch (e) {
            emit('error', { error: 'start-failed', message: e.message });
            return false;
        }
    }

    function stop() {
        restartToken++;
        manualStop = true;
        restartPending = false;

        // Promote interim to final
        const partial = interimText.trim();
        if (partial && !finalText.endsWith(partial)) {
            finalText = (finalText + ' ' + partial).trim();
            interimText = '';
            emit('result', { final: finalText, interim: '', fullText: finalText });
        }

        try { recognition?.stop(); } catch (_) { /* noop */ }
        engineListening = false;
        setState('idle');
    }

    function destroy() {
        stop();
        recognition = null;
        listeners.result.length = 0;
        listeners.error.length = 0;
        listeners.stateChange.length = 0;
        setState('destroyed');
    }

    function onResult(fn) {
        listeners.result.push(fn);
        return () => { listeners.result = listeners.result.filter(f => f !== fn); };
    }

    function onError(fn) {
        listeners.error.push(fn);
        return () => { listeners.error = listeners.error.filter(f => f !== fn); };
    }

    function onStateChange(fn) {
        listeners.stateChange.push(fn);
        return () => { listeners.stateChange = listeners.stateChange.filter(f => f !== fn); };
    }

    function getState() { return state; }

    function getText() {
        return {
            final: finalText,
            interim: interimText,
            fullText: [finalText, interimText].filter(Boolean).join(' ').trim(),
        };
    }

    function clearText() { finalText = ''; interimText = ''; }

    function setLang(newLang) {
        cfg.lang = newLang;
        if (state === 'listening' || state === 'restarting') {
            stop();
            recognition = null;
            setTimeout(() => start(false), 200);
        } else {
            recognition = null;
        }
    }

    return Object.freeze({
        start, stop, destroy,
        onResult, onError, onStateChange,
        getState, getText, clearText, setLang,
    });
}
