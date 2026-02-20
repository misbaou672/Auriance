/**
 * Auriance Voice SDK — VoiceFormField Component
 * A text input with a built-in mic button for voice dictation.
 *
 * Usage:
 *   import { VoiceFormField } from '@auriance/voice-sdk/react';
 *
 *   <VoiceFormField
 *     label="Patient Name"
 *     value={name}
 *     onChange={(val) => setName(val)}
 *     lang="fr-FR"
 *     placeholder="Dictate or type..."
 *   />
 */
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { createVoiceRecognizer, isWebSpeechSupported } from '../auriance-voice-sdk.js';

// ── Inline styles ─────────────────────────────────────────────────────────────

const defaultStyles = {
    wrapper: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        width: '100%',
    },
    label: {
        fontSize: '13px',
        fontWeight: 600,
        color: '#374151',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    inputRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '0',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        overflow: 'hidden',
        background: '#fff',
        transition: 'border-color 0.2s',
    },
    inputRowFocused: {
        borderColor: '#3b82f6',
        boxShadow: '0 0 0 2px rgba(59,130,246,0.15)',
    },
    inputRowListening: {
        borderColor: '#ef4444',
        boxShadow: '0 0 0 2px rgba(239,68,68,0.15)',
    },
    input: {
        flex: 1,
        border: 'none',
        outline: 'none',
        padding: '10px 12px',
        fontSize: '14px',
        color: '#1e293b',
        fontFamily: 'inherit',
        background: 'transparent',
    },
    textarea: {
        flex: 1,
        border: 'none',
        outline: 'none',
        padding: '10px 12px',
        fontSize: '14px',
        color: '#1e293b',
        fontFamily: 'inherit',
        background: 'transparent',
        resize: 'vertical',
        minHeight: '80px',
    },
    micButton: (isListening) => ({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 38,
        height: 38,
        margin: '3px',
        borderRadius: '6px',
        border: 'none',
        cursor: 'pointer',
        background: isListening ? '#ef4444' : '#f1f5f9',
        color: isListening ? '#fff' : '#64748b',
        fontSize: '16px',
        transition: 'all 0.2s',
        flexShrink: 0,
    }),
    error: {
        fontSize: '12px',
        color: '#dc2626',
        marginTop: '2px',
    },
};

// ── Mic icons ─────────────────────────────────────────────────────────────────

const MicIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" x2="12" y1="19" y2="22" />
    </svg>
);

const StopIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
);

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * @param {Object} props
 * @param {string}  [props.label]                  Field label
 * @param {string}  [props.value='']               Controlled value
 * @param {Function} props.onChange                 Callback(newValue)
 * @param {string}  [props.lang='fr-FR']           Voice language
 * @param {boolean} [props.punctuation=false]       Voice punctuation
 * @param {string}  [props.placeholder]            Input placeholder
 * @param {boolean} [props.multiline=false]         Use textarea instead of input
 * @param {boolean} [props.appendMode=false]        Append voice text instead of replace
 * @param {boolean} [props.disabled=false]          Disable input
 * @param {Object}  [props.style]                  Override wrapper style
 * @param {string}  [props.className]              Additional CSS class
 * @param {Object}  [props.styles]                 Override individual style keys
 */
export function VoiceFormField({
    label,
    value = '',
    onChange,
    lang = 'fr-FR',
    punctuation = false,
    placeholder = '',
    multiline = false,
    appendMode = false,
    disabled = false,
    style,
    className,
    styles: styleOverrides = {},
}) {
    const [isListening, setIsListening] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [error, setError] = useState(null);
    const recognizerRef = useRef(null);
    const supported = isWebSpeechSupported();

    // Cleanup on unmount
    useEffect(() => {
        return () => recognizerRef.current?.destroy();
    }, []);

    const handleMicToggle = useCallback(() => {
        if (isListening) {
            recognizerRef.current?.stop();
            setIsListening(false);
        } else {
            if (recognizerRef.current) recognizerRef.current.destroy();

            const rec = createVoiceRecognizer({
                lang,
                punctuation,
                autoRestart: true,
                continuous: true,
                interimResults: true,
            });

            const baseText = appendMode ? value : '';

            rec.onResult(({ fullText }) => {
                const newVal = appendMode ? (baseText + (baseText ? ' ' : '') + fullText) : fullText;
                onChange?.(newVal);
            });

            rec.onError(({ message }) => {
                setError(message);
                setTimeout(() => setError(null), 3000);
            });

            rec.onStateChange(({ state }) => {
                if (state === 'idle' || state === 'error' || state === 'destroyed') {
                    setIsListening(false);
                }
            });

            recognizerRef.current = rec;
            rec.start();
            setIsListening(true);
            setError(null);
        }
    }, [isListening, lang, punctuation, appendMode, value, onChange]);

    const handleInputChange = useCallback((e) => {
        onChange?.(e.target.value);
    }, [onChange]);

    const s = (key) => ({ ...defaultStyles[key], ...styleOverrides?.[key] });

    const inputRowStyle = {
        ...s('inputRow'),
        ...(isListening ? defaultStyles.inputRowListening : {}),
        ...(isFocused && !isListening ? defaultStyles.inputRowFocused : {}),
    };

    const InputTag = multiline ? 'textarea' : 'input';
    const inputStyle = multiline ? s('textarea') : s('input');

    return (
        <div style={{ ...s('wrapper'), ...style }} className={className}>
            {label && <label style={s('label')}>{label}</label>}

            <div style={inputRowStyle}>
                <InputTag
                    style={inputStyle}
                    value={value}
                    onChange={handleInputChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                />

                {supported && (
                    <button
                        onClick={handleMicToggle}
                        style={defaultStyles.micButton(isListening)}
                        title={isListening ? 'Stop dictation' : 'Start dictation'}
                        type="button"
                        disabled={disabled}
                    >
                        {isListening ? <StopIcon /> : <MicIcon />}
                    </button>
                )}
            </div>

            {error && <div style={s('error')}>{error}</div>}
        </div>
    );
}
