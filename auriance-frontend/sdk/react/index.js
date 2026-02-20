/**
 * Auriance Voice SDK — React bindings
 *
 * Usage:
 *   import { useVoiceRecognizer, VoiceTranscriber, VoiceFormField, VoiceAutoForm } from '@auriance/voice-sdk/react';
 */

// Hook
export { useVoiceRecognizer } from './useVoiceRecognizer.js';

// Components
export { VoiceTranscriber } from './VoiceTranscriber.jsx';
export { VoiceFormField } from './VoiceFormField.jsx';
export { VoiceAutoForm, extractFieldValues, MEDICAL_FIELDS_FR, MEDICAL_FIELDS_EN } from './VoiceAutoForm.jsx';
