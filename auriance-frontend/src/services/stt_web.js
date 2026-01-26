
// src/services/stt_web.js

export class WebSTTService {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.transcript = '';
        this.callbacks = {
            onResult: null,
            onError: null,
            onStart: null,
            onEnd: null
        };
    }

    initialize(language = 'fr-FR') {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.error("Web Speech API not supported in this browser.");
            return false;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();

        // Critical settings for continuous dictation
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = language;
        // Decrease usage of alternatives to save bandwidth/processing
        this.recognition.maxAlternatives = 1;

        this.recognition.onstart = () => {
            console.log("🎤 STT Started");
            this.isListening = true;
            if (this.callbacks.onStart) this.callbacks.onStart();
        };

        this.recognition.onend = () => {
            console.log("🛑 STT Ended");
            // Auto-restart if it cuts off but we still want to listen (a common issue with Web Speech API)
            if (this.isListening) {
                console.log("🔄 Auto-restarting STT...");
                try {
                    this.recognition.start();
                } catch (e) {
                    console.warn("Could not restart immediately:", e);
                    this.isListening = false;
                    if (this.callbacks.onEnd) this.callbacks.onEnd();
                }
            } else {
                if (this.callbacks.onEnd) this.callbacks.onEnd();
            }
        };

        this.recognition.onresult = (event) => {
            let interim = '';
            let final = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    final += event.results[i][0].transcript;
                } else {
                    interim += event.results[i][0].transcript;
                }
            }

            if (this.callbacks.onResult) {
                this.callbacks.onResult({ final, interim });
            }
        };

        this.recognition.onerror = (event) => {
            console.error("⚠️ STT Error:", event.error);
            if (event.error === 'not-allowed') {
                alert("L'accès au micro est bloqué. Veuillez l'autoriser dans la barre d'adresse.");
                this.isListening = false;
            }
            if (this.callbacks.onError) this.callbacks.onError(event.error);
        };

        return true;
    }

    start(onResultCallback) {
        if (!this.recognition) {
            this.initialize();
        }
        if (this.isListening) return;

        this.callbacks.onResult = onResultCallback;

        try {
            this.recognition.start();
        } catch (e) {
            console.error("Start error:", e);
        }
    }

    stop() {
        if (!this.recognition) return;
        this.isListening = false; // Prevent auto-restart
        try {
            this.recognition.stop();
        } catch (e) {
            console.error("Stop error:", e);
        }
    }
}

export const sttService = new WebSTTService();
