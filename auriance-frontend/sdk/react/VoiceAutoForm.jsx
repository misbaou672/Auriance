/**
 * Auriance Voice SDK — VoiceAutoForm Component
 * Voice-driven auto-fill form. Speak naturally and fields get filled via trigger keywords.
 *
 * Usage:
 *   import { VoiceAutoForm } from '@auriance/voice-sdk/react';
 *
 *   <VoiceAutoForm
 *     lang="fr-FR"
 *     fields={[
 *       { name: 'patient', label: 'Patient', triggers: ['patient', 'nom', 'monsieur', 'madame'] },
 *       { name: 'age', label: 'Age', triggers: ['age', 'ans', 'il a', 'elle a'] },
 *       { name: 'symptoms', label: 'Symptoms', triggers: ['symptômes', 'douleur', 'mal'] },
 *       { name: 'diagnosis', label: 'Diagnostic', triggers: ['diagnostic', 'conclusion'] },
 *       { name: 'treatment', label: 'Traitement', triggers: ['traitement', 'médicament', 'prescrire'] },
 *     ]}
 *     onFieldsChange={(data) => console.log(data)}
 *     onSubmit={(data) => saveToServer(data)}
 *   />
 */
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useVoiceRecognizer } from './useVoiceRecognizer.js';
import { isWebSpeechSupported } from '../auriance-voice-sdk.js';

// ── Built-in field presets ────────────────────────────────────────────────────

export const MEDICAL_FIELDS_FR = [
    { name: 'patient', label: 'Patient', triggers: ['patient', 'monsieur', 'madame', 'enfant', 'nom'] },
    { name: 'age', label: 'Âge', triggers: ['âge', 'age', 'ans', 'il a', 'elle a'] },
    { name: 'symptoms', label: 'Symptômes', triggers: ['symptômes', 'symptôme', 'signes', 'douleur', 'mal', 'plainte', 'motif'] },
    { name: 'medication', label: 'Médicaments', triggers: ['médicament', 'traitement', 'prescrire', 'ordonnance', 'prendre'] },
    { name: 'diagnosis', label: 'Diagnostic', triggers: ['diagnostic', 'conclusion', 'résultat', 'il s\'agit', 'souffre'] },
    { name: 'recommendations', label: 'Recommandations', triggers: ['recommandation', 'conseil', 'revoir', 'rendez-vous', 'attention'] },
];

export const MEDICAL_FIELDS_EN = [
    { name: 'patient', label: 'Patient', triggers: ['patient', 'mr', 'mrs', 'child', 'name', 'subject'] },
    { name: 'age', label: 'Age', triggers: ['age', 'years old', 'he is', 'she is'] },
    { name: 'symptoms', label: 'Symptoms', triggers: ['symptoms', 'symptom', 'signs', 'pain', 'hurts', 'complains', 'reason'] },
    { name: 'medication', label: 'Prescribed Med', triggers: ['medication', 'treatment', 'prescribe', 'prescription', 'take', 'give'] },
    { name: 'diagnosis', label: 'Diagnosis', triggers: ['diagnosis', 'conclusion', 'result', 'it is', 'suffering from'] },
    { name: 'recommendations', label: 'Recommendations', triggers: ['recommendation', 'advice', 'see again', 'appointment', 'watch out'] },
];

// ── Inline styles ─────────────────────────────────────────────────────────────

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
        padding: '14px 16px',
        borderBottom: '1px solid #e2e8f0',
        background: '#f8fafc',
    },
    title: {
        fontSize: '15px',
        fontWeight: 600,
        color: '#1e293b',
        margin: 0,
    },
    badge: (isListening) => ({
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 10px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 500,
        background: isListening ? '#fef2f2' : '#f1f5f9',
        color: isListening ? '#dc2626' : '#64748b',
    }),
    dot: (isListening) => ({
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: isListening ? '#dc2626' : '#94a3b8',
    }),
    transcript: {
        padding: '12px 16px',
        background: '#f8fafc',
        borderBottom: '1px solid #e2e8f0',
        fontSize: '13px',
        color: '#64748b',
        maxHeight: '80px',
        overflowY: 'auto',
        whiteSpace: 'pre-wrap',
        lineHeight: 1.5,
    },
    transcriptLabel: {
        fontSize: '11px',
        fontWeight: 600,
        color: '#94a3b8',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: '4px',
    },
    fields: {
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    fieldRow: (isActive) => ({
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        padding: '10px 12px',
        borderRadius: '8px',
        border: isActive ? '1px solid #3b82f6' : '1px solid #e2e8f0',
        background: isActive ? '#eff6ff' : '#fff',
        transition: 'all 0.2s',
    }),
    fieldLabel: {
        fontSize: '12px',
        fontWeight: 600,
        color: '#6b7280',
        textTransform: 'uppercase',
        letterSpacing: '0.3px',
    },
    fieldInput: {
        border: 'none',
        outline: 'none',
        background: 'transparent',
        fontSize: '14px',
        color: '#1e293b',
        padding: '4px 0',
        fontFamily: 'inherit',
        width: '100%',
    },
    fieldPlaceholder: {
        color: '#cbd5e1',
        fontStyle: 'italic',
    },
    controls: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 16px',
        borderTop: '1px solid #e2e8f0',
        background: '#f8fafc',
        flexWrap: 'wrap',
    },
    micButton: (isListening) => ({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        height: 40,
        padding: '0 16px',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        background: isListening ? '#ef4444' : '#3b82f6',
        color: '#fff',
        fontSize: '13px',
        fontWeight: 500,
        transition: 'all 0.2s',
    }),
    secondaryButton: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: 40,
        padding: '0 16px',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        cursor: 'pointer',
        background: '#fff',
        color: '#64748b',
        fontSize: '13px',
        fontWeight: 500,
    },
    submitButton: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: 40,
        padding: '0 16px',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        background: '#22c55e',
        color: '#fff',
        fontSize: '13px',
        fontWeight: 500,
        marginLeft: 'auto',
    },
    errorBar: {
        padding: '8px 16px',
        background: '#fef2f2',
        color: '#dc2626',
        fontSize: '13px',
    },
    unsupported: {
        padding: '24px',
        textAlign: 'center',
        color: '#dc2626',
        fontSize: '14px',
    },
};

// ── Icons ─────────────────────────────────────────────────────────────────────

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

// ── Entity extraction engine ──────────────────────────────────────────────────

function extractFieldValues(text, fields) {
    if (!text) return {};

    const normalize = (str) => str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const normalizedText = normalize(text);
    const matches = [];

    for (const field of fields) {
        if (!field.triggers) continue;
        for (const rawTrigger of field.triggers) {
            const trigger = normalize(rawTrigger);
            const regex = new RegExp(`(?:^|[\\s.,;:-])(?:${trigger})(?:[\\s.,;:-]|$)`, 'gi');
            let m;
            while ((m = regex.exec(normalizedText)) !== null) {
                matches.push({
                    name: field.name,
                    index: m.index,
                    contentStartIndex: m.index + m[0].length,
                });
            }
        }
    }

    matches.sort((a, b) => a.index - b.index);
    const values = {};

    for (let i = 0; i < matches.length; i++) {
        const match = matches[i];
        const contentStart = match.contentStartIndex;
        const contentEnd = matches[i + 1] ? matches[i + 1].index : text.length;

        if (contentEnd > contentStart) {
            let rawValue = text.substring(contentStart, contentEnd);
            let cleanValue = rawValue
                .replace(/^[:\-\s,]+/, '')
                .replace(/^(du|de|le|la|les|des|un|une|est|a|is|the|of)\s+/i, '')
                .replace(/[.,\s]+$/, '')
                .trim();

            if (cleanValue.length > 0) {
                values[match.name] = cleanValue.charAt(0).toUpperCase() + cleanValue.slice(1);
            }
        }
    }

    return values;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * @param {Object} props
 * @param {Array}    props.fields                   Field definitions [{name, label, triggers?, placeholder?}]
 * @param {string}   [props.lang='fr-FR']           Voice language
 * @param {boolean}  [props.punctuation=false]       Punctuation mode
 * @param {string}   [props.title='Voice Auto-Form'] Panel title
 * @param {boolean}  [props.showTranscript=true]     Show raw transcript
 * @param {boolean}  [props.showSubmit=true]         Show submit button
 * @param {string}   [props.submitLabel='Submit']    Submit button text
 * @param {Function} [props.onFieldsChange]          Callback({name: value, ...}) on any change
 * @param {Function} [props.onSubmit]                Callback({name: value, ...}) on submit
 * @param {Function} [props.onExtract]               Custom extraction fn(text, fields) -> {name: value}
 * @param {Object}   [props.initialValues]           Initial field values {name: value}
 * @param {Object}   [props.style]                   Override container style
 * @param {string}   [props.className]               Additional CSS class
 * @param {Object}   [props.styles]                  Override individual style keys
 */
export function VoiceAutoForm({
    fields,
    lang = 'fr-FR',
    punctuation = false,
    title = 'Voice Auto-Form',
    showTranscript = true,
    showSubmit = true,
    submitLabel = 'Submit',
    onFieldsChange,
    onSubmit,
    onExtract,
    initialValues = {},
    style,
    className,
    styles: styleOverrides = {},
}) {
    const { isListening, isSupported, transcript, error, start, stop, clear } = useVoiceRecognizer({
        lang,
        punctuation,
        autoRestart: true,
        continuous: true,
        interimResults: true,
    });

    // Field values state
    const [values, setValues] = useState(() => {
        const init = {};
        for (const f of fields) init[f.name] = initialValues[f.name] || '';
        return init;
    });
    const [activeField, setActiveField] = useState(null);

    // Reset when fields change
    useEffect(() => {
        const init = {};
        for (const f of fields) init[f.name] = initialValues[f.name] || '';
        setValues(init);
    }, [fields]);

    // Extract entities from transcript
    useEffect(() => {
        if (!transcript.fullText) return;

        const extracted = onExtract
            ? onExtract(transcript.fullText, fields)
            : extractFieldValues(transcript.fullText, fields);

        if (extracted && Object.keys(extracted).length > 0) {
            setValues(prev => {
                const next = { ...prev, ...extracted };
                return next;
            });
        }
    }, [transcript.fullText, fields, onExtract]);

    // Notify parent on values change
    const prevValues = useRef(values);
    useEffect(() => {
        if (JSON.stringify(values) !== JSON.stringify(prevValues.current)) {
            prevValues.current = values;
            onFieldsChange?.(values);
        }
    }, [values, onFieldsChange]);

    const handleFieldChange = useCallback((name, val) => {
        setValues(prev => ({ ...prev, [name]: val }));
    }, []);

    const handleToggle = useCallback(() => {
        if (isListening) {
            stop();
        } else {
            start();
        }
    }, [isListening, start, stop]);

    const handleClear = useCallback(() => {
        clear();
        const empty = {};
        for (const f of fields) empty[f.name] = '';
        setValues(empty);
        onFieldsChange?.(empty);
    }, [clear, fields, onFieldsChange]);

    const handleSubmit = useCallback(() => {
        if (isListening) stop();
        onSubmit?.(values);
    }, [values, isListening, stop, onSubmit]);

    const s = (key) => ({ ...defaultStyles[key], ...styleOverrides?.[key] });

    if (!isSupported) {
        return (
            <div style={{ ...s('container'), ...style }} className={className}>
                <div style={s('unsupported')}>
                    Web Speech API is not supported in this browser. Please use Chrome or Edge.
                </div>
            </div>
        );
    }

    return (
        <div style={{ ...s('container'), ...style }} className={className}>
            {/* Header */}
            <div style={s('header')}>
                <h3 style={s('title')}>{title}</h3>
                <span style={defaultStyles.badge(isListening)}>
                    <span style={defaultStyles.dot(isListening)} />
                    {isListening ? 'Listening...' : 'Idle'}
                </span>
            </div>

            {/* Error */}
            {error && <div style={s('errorBar')}>{error.message}</div>}

            {/* Raw transcript */}
            {showTranscript && transcript.fullText && (
                <div style={s('transcript')}>
                    <div style={s('transcriptLabel')}>Raw transcript</div>
                    {transcript.fullText}
                </div>
            )}

            {/* Fields */}
            <div style={s('fields')}>
                {fields.map((field) => (
                    <div
                        key={field.name}
                        style={defaultStyles.fieldRow(activeField === field.name)}
                        onClick={() => setActiveField(field.name)}
                    >
                        <label style={s('fieldLabel')}>{field.label}</label>
                        <input
                            style={s('fieldInput')}
                            value={values[field.name] || ''}
                            onChange={(e) => handleFieldChange(field.name, e.target.value)}
                            placeholder={field.placeholder || `${field.label}...`}
                            onFocus={() => setActiveField(field.name)}
                            onBlur={() => setActiveField(null)}
                        />
                    </div>
                ))}
            </div>

            {/* Controls */}
            <div style={s('controls')}>
                <button
                    onClick={handleToggle}
                    style={defaultStyles.micButton(isListening)}
                    type="button"
                >
                    {isListening ? <StopIcon /> : <MicIcon />}
                    <span>{isListening ? 'Stop' : 'Dictate'}</span>
                </button>

                <button onClick={handleClear} style={s('secondaryButton')} type="button">
                    Clear
                </button>

                {showSubmit && (
                    <button onClick={handleSubmit} style={s('submitButton')} type="button">
                        {submitLabel}
                    </button>
                )}
            </div>
        </div>
    );
}

// Export extraction engine for advanced usage
export { extractFieldValues };
