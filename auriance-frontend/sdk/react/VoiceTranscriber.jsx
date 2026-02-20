/**
 * Auriance Voice SDK — VoiceTranscriber Component
 * Drop-in live transcription panel for any React app.
 *
 * Usage:
 *   import { VoiceTranscriber } from '@auriance/voice-sdk/react';
 *
 *   <VoiceTranscriber
 *     lang="fr-FR"
 *     punctuation={true}
 *     onTranscriptChange={(text) => console.log(text)}
 *     placeholder="Click the mic and start speaking..."
 *   />
 */
import React, { useState, useCallback } from 'react';
import { useVoiceRecognizer } from './useVoiceRecognizer.js';

// ── Default inline styles (fully overridable) ─────────────────────────────────

const defaultStyles = {
    container: {
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        overflow: 'hidden',
        background: '#fff',
        maxWidth: '100%',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderBottom: '1px solid #e2e8f0',
        background: '#f8fafc',
    },
    title: {
        fontSize: '14px',
        fontWeight: 600,
        color: '#1e293b',
        margin: 0,
    },
    statusDot: (isListening) => ({
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: isListening ? '#22c55e' : '#94a3b8',
        animation: isListening ? 'auriance-pulse 1.5s infinite' : 'none',
        marginRight: 8,
        flexShrink: 0,
    }),
    statusRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '12px',
        color: '#64748b',
    },
    body: {
        padding: '16px',
        minHeight: '120px',
        maxHeight: '400px',
        overflowY: 'auto',
        lineHeight: 1.7,
        fontSize: '15px',
        color: '#1e293b',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
    },
    placeholder: {
        color: '#94a3b8',
        fontStyle: 'italic',
    },
    interimText: {
        color: '#94a3b8',
    },
    controls: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 16px',
        borderTop: '1px solid #e2e8f0',
        background: '#f8fafc',
    },
    micButton: (isListening) => ({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 44,
        height: 44,
        borderRadius: '50%',
        border: 'none',
        cursor: 'pointer',
        background: isListening ? '#ef4444' : '#3b82f6',
        color: '#fff',
        fontSize: '18px',
        transition: 'background 0.2s, transform 0.1s',
        flexShrink: 0,
    }),
    clearButton: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: 36,
        padding: '0 14px',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        cursor: 'pointer',
        background: '#fff',
        color: '#64748b',
        fontSize: '13px',
        marginLeft: 'auto',
    },
    langSelect: {
        height: 36,
        padding: '0 10px',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        background: '#fff',
        color: '#1e293b',
        fontSize: '13px',
        cursor: 'pointer',
    },
    errorBar: {
        padding: '8px 16px',
        background: '#fef2f2',
        color: '#dc2626',
        fontSize: '13px',
        borderTop: '1px solid #fecaca',
    },
    unsupported: {
        padding: '24px',
        textAlign: 'center',
        color: '#dc2626',
        fontSize: '14px',
    },
};

// ── Mic icons (inline SVG, no dependency) ─────────────────────────────────────

const MicIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" x2="12" y1="19" y2="22" />
    </svg>
);

const StopIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
);

// ── Keyframes injection (once) ────────────────────────────────────────────────

let stylesInjected = false;
function injectKeyframes() {
    if (stylesInjected || typeof document === 'undefined') return;
    stylesInjected = true;
    const style = document.createElement('style');
    style.textContent = `
        @keyframes auriance-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
        }
    `;
    document.head.appendChild(style);
}

// ── Available languages ───────────────────────────────────────────────────────

const DEFAULT_LANGUAGES = [
    { code: 'fr-FR', label: 'Français' },
    { code: 'en-US', label: 'English' },
    { code: 'es-ES', label: 'Español' },
    { code: 'de-DE', label: 'Deutsch' },
    { code: 'it-IT', label: 'Italiano' },
    { code: 'pt-PT', label: 'Português' },
    { code: 'zh-CN', label: '中文' },
    { code: 'ar-SA', label: 'العربية' },
    { code: 'ja-JP', label: '日本語' },
    { code: 'ru-RU', label: 'Русский' },
];

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * @param {Object} props
 * @param {string}  [props.lang='fr-FR']               Initial language
 * @param {boolean} [props.autoRestart=true]            Auto-restart on silence
 * @param {boolean} [props.punctuation=true]            Voice punctuation commands
 * @param {boolean} [props.showLanguageSelector=true]   Show lang dropdown
 * @param {boolean} [props.showClearButton=true]        Show clear button
 * @param {Array}   [props.languages]                   Custom language list [{code, label}]
 * @param {string}  [props.placeholder]                 Placeholder text
 * @param {string}  [props.title]                       Panel title
 * @param {Function} [props.onTranscriptChange]         Callback(fullText) on every change
 * @param {Function} [props.onStateChange]              Callback(state) on state change
 * @param {Object}  [props.style]                       Override container style
 * @param {string}  [props.className]                   Additional CSS class
 * @param {Object}  [props.styles]                      Override individual style keys
 */
export function VoiceTranscriber({
    lang: initialLang = 'fr-FR',
    autoRestart = true,
    punctuation = true,
    showLanguageSelector = true,
    showClearButton = true,
    languages = DEFAULT_LANGUAGES,
    placeholder = 'Click the mic and start speaking...',
    title = 'Voice Transcription',
    onTranscriptChange,
    onStateChange,
    style,
    className,
    styles: styleOverrides = {},
}) {
    injectKeyframes();

    const [lang, setLang] = useState(initialLang);
    const { isListening, isSupported, transcript, error, start, stop, clear, state } = useVoiceRecognizer({
        lang,
        autoRestart,
        punctuation,
        continuous: true,
        interimResults: true,
    });

    // Notify parent
    const prevFullText = React.useRef('');
    React.useEffect(() => {
        if (transcript.fullText !== prevFullText.current) {
            prevFullText.current = transcript.fullText;
            onTranscriptChange?.(transcript.fullText);
        }
    }, [transcript.fullText, onTranscriptChange]);

    React.useEffect(() => {
        onStateChange?.(state);
    }, [state, onStateChange]);

    const handleToggle = useCallback(() => {
        if (isListening) {
            stop();
        } else {
            start();
        }
    }, [isListening, start, stop]);

    const handleClear = useCallback(() => {
        clear();
        onTranscriptChange?.('');
    }, [clear, onTranscriptChange]);

    const handleLangChange = useCallback((e) => {
        setLang(e.target.value);
    }, []);

    const s = (key) => ({ ...defaultStyles[key], ...styleOverrides[key] });

    if (!isSupported) {
        return (
            <div style={{ ...s('container'), ...style }} className={className}>
                <div style={s('unsupported')}>
                    Web Speech API is not supported in this browser. Please use Chrome or Edge.
                </div>
            </div>
        );
    }

    const hasText = transcript.final || transcript.interim;

    return (
        <div style={{ ...s('container'), ...style }} className={className}>
            {/* Header */}
            <div style={s('header')}>
                <h3 style={s('title')}>{title}</h3>
                <div style={s('statusRow')}>
                    <div style={defaultStyles.statusDot(isListening)} />
                    <span>{isListening ? 'Listening...' : 'Idle'}</span>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div style={s('errorBar')}>{error.message}</div>
            )}

            {/* Transcript body */}
            <div style={s('body')}>
                {!hasText && <span style={s('placeholder')}>{placeholder}</span>}
                {transcript.final && <span>{transcript.final}</span>}
                {transcript.final && transcript.interim && ' '}
                {transcript.interim && <span style={s('interimText')}>{transcript.interim}</span>}
            </div>

            {/* Controls */}
            <div style={s('controls')}>
                <button
                    onClick={handleToggle}
                    style={defaultStyles.micButton(isListening)}
                    title={isListening ? 'Stop' : 'Start'}
                    type="button"
                >
                    {isListening ? <StopIcon /> : <MicIcon />}
                </button>

                {showLanguageSelector && (
                    <select
                        value={lang}
                        onChange={handleLangChange}
                        style={s('langSelect')}
                    >
                        {languages.map(l => (
                            <option key={l.code} value={l.code}>{l.label}</option>
                        ))}
                    </select>
                )}

                {showClearButton && (
                    <button onClick={handleClear} style={s('clearButton')} type="button">
                        Clear
                    </button>
                )}
            </div>
        </div>
    );
}
