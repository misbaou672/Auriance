# AURIANCE Whisper/Silero STT API

AURIANCE intègre désormais une API de reconnaissance vocale avancée basée sur Whisper (OpenAI) et Silero VAD (Voice Activity Detection).

## Endpoints principaux

- `POST /api/voice/transcribe` : Transcription audio (Whisper + Silero VAD)
- `POST /api/voice/transcribe-and-analyze` : Transcription + analyse IA
- `POST /api/voice/detect-language` : Détection de langue audio
- `GET  /api/voice/supported-languages` : Langues supportées par Whisper
- `GET  /api/voice/health` : Statut du service vocal

## Utilisation

### Transcription audio (Whisper + Silero)
```bash
curl -X POST "http://localhost:8000/api/voice/transcribe" \
  -F "audio_file=@/chemin/vers/fichier.wav" \
  -F "language=fr" \
  -F "model_size=base" \
  -F "medical_context=true"
```
- Le service détecte automatiquement la parole (Silero VAD) et retire les silences/bruits.
- Le modèle Whisper effectue la transcription (choix du modèle possible : tiny, base, small, medium, large).

### Détection de langue
```bash
curl -X POST "http://localhost:8000/api/voice/detect-language" \
  -F "audio_file=@/chemin/vers/fichier.wav"
```

### Statut du service
```bash
curl http://localhost:8000/api/voice/health
```

## Installation des dépendances (backend)

- Pour Whisper :
  ```bash
  pip install openai-whisper torch torchaudio
  ```
- Pour Silero VAD :
  ```bash
  pip install torch torchaudio
  # Silero VAD est téléchargé automatiquement via torch.hub
  ```

## Notes
- Le service fonctionne même si Whisper/Silero ne sont pas installés (mode dégradé).
- Les endpoints vérifient la disponibilité des modèles à l'exécution.
- Compatible avec tous les formats audio courants (wav, mp3, m4a, ogg, etc.).

---

**AURIANCE** combine la puissance de Whisper (OpenAI) et la précision de Silero VAD pour une transcription vocale professionnelle, multilingue et robuste.
