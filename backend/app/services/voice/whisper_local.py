import os
import logging
import numpy as np
from typing import Dict, List, Optional
import asyncio

logger = logging.getLogger(__name__)

class WhisperLocalEngine:
    """
    Implémentation Whisper locale - Version simplifiée sans whisper_cpp
    """
    
    def __init__(self, model_size: str = "base"):
        self.model_size = model_size
        self.model = None
        self.backend = "fallback"
        self._load_model()
    
    def _load_model(self):
        """Charger le modèle Whisper (version simplifiée)"""
        try:
            # Essayer d'abord whisper original
            try:
                import whisper
                self.model = whisper.load_model(self.model_size)
                self.backend = "whisper_original"
                logger.info("✓ Whisper original chargé")
                return
            except ImportError:
                logger.warning("Whisper non disponible")
            
            # Fallback: Utiliser SpeechRecognition
            try:
                import speech_recognition as sr
                self.recognizer = sr.Recognizer()
                self.backend = "speech_recognition"
                logger.info("✓ SpeechRecognition chargé (fallback)")
                return
            except ImportError:
                logger.warning("SpeechRecognition non disponible")
            
            # Dernier recours: mock pour tests
            self.backend = "mock"
            logger.warning("✓ Mode mock activé - Aucun modèle de reconnaissance chargé")
            
        except Exception as e:
            logger.error(f"Erreur chargement modèle: {e}")
            self.backend = "error"
    
    async def transcribe(self, audio_data: bytes, language: str = "fr", **kwargs) -> Dict:
        """Transcrire l'audio"""
        try:
            if self.backend == "whisper_original":
                return await self._transcribe_whisper(audio_data, language)
            elif self.backend == "speech_recognition":
                return await self._transcribe_speech_recognition(audio_data, language)
            else:
                return await self._transcribe_mock(audio_data, language)
                
        except Exception as e:
            logger.error(f"Erreur transcription: {e}")
            return {
                'text': f"Erreur transcription: {str(e)}",
                'language': language,
                'confidence': 0.0,
                'word_timestamps': [],
                'alternatives': []
            }
    
    async def _transcribe_whisper(self, audio_data: bytes, language: str) -> Dict:
        """Transcription avec Whisper original"""
        import whisper
        import tempfile
        
        # Sauvegarder l'audio dans un fichier temporaire
        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_audio:
            temp_audio.write(audio_data)
            temp_audio.flush()
            
            # Transcrire avec Whisper
            result = self.model.transcribe(temp_audio.name, language=language)
            
            # Nettoyer le fichier temporaire
            os.unlink(temp_audio.name)
            
            return {
                'text': result['text'],
                'language': language,
                'confidence': 0.9,
                'word_timestamps': result.get('segments', []),
                'alternatives': []
            }
    
    async def _transcribe_speech_recognition(self, audio_data: bytes, language: str) -> Dict:
        """Transcription avec SpeechRecognition"""
        import speech_recognition as sr
        import tempfile
        
        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_audio:
            temp_audio.write(audio_data)
            temp_audio.flush()
            
            with sr.AudioFile(temp_audio.name) as source:
                audio = self.recognizer.record(source)
                text = self.recognizer.recognize_google(audio, language=language)
            
            os.unlink(temp_audio.name)
            
            return {
                'text': text,
                'language': language,
                'confidence': 0.8,
                'word_timestamps': [],
                'alternatives': []
            }
    
    async def _transcribe_mock(self, audio_data: bytes, language: str) -> Dict:
        """Transcription mock pour tests"""
        return {
            'text': "[MOCK] Transcription vocale simulée - Installez whisper ou speech_recognition",
            'language': language,
            'confidence': 0.1,
            'word_timestamps': [],
            'alternatives': []
        }
    
    def get_name(self) -> str:
        return "Whisper Local"
    
    def get_description(self) -> str:
        return "Moteur de reconnaissance vocale local"
    
    def supports_offline(self) -> bool:
        return self.backend in ["whisper_original", "mock"]
    
    def get_optimal_hardware(self) -> str:
        return "CPU"
    
    def get_supported_languages(self) -> List[str]:
        return ["fr", "en", "es", "de", "it", "pt"]

# Instance globale
whisper_local_engine = WhisperLocalEngine()