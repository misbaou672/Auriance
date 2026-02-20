/**
 * Auriance Voice SDK — Main entry point
 *
 * Core (framework-agnostic):
 *   import { createVoiceRecognizer, isWebSpeechSupported } from '@auriance/voice-sdk';
 *
 * React components:
 *   import { useVoiceRecognizer, VoiceTranscriber, VoiceFormField, VoiceAutoForm } from '@auriance/voice-sdk/react';
 */

// Core engine (works in any JS environment with Web Speech API)
export {
    createVoiceRecognizer,
    isWebSpeechSupported,
    FRENCH_PUNCTUATION_RULES,
} from './auriance-voice-sdk.js';

// React bindings (requires React 16.8+)
export {
    useVoiceRecognizer,
    VoiceTranscriber,
    VoiceFormField,
    VoiceAutoForm,
    extractFieldValues,
    MEDICAL_FIELDS_FR,
    MEDICAL_FIELDS_EN,
} from './react/index.js';
