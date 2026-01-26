"""
Whisper Service - Service de transcription audio avec Whisper
Version optimisée pour le streaming temps réel
"""

import logging
import tempfile
import os
import time
from datetime import datetime
from typing import Dict, Any, Optional, List
import numpy as np

try:
    import whisper
    WHISPER_AVAILABLE = True
except ImportError:
    WHISPER_AVAILABLE = False
    logging.warning("Whisper non disponible")

logger = logging.getLogger(__name__)

class WhisperStreamingService:
    """Service Whisper avec support streaming"""
    
    def __init__(self, model_size: str = "base", device: str = "auto"):
        self.model_size = model_size
        self.device = device
        self.model = None
        self.is_loaded = False
        self._load_model()
    
    def _load_model(self):
        """Charger le modèle Whisper"""
        if not WHISPER_AVAILABLE:
            logger.error("❌ Whisper non installé")
            return
        
        try:
            logger.info(f"🔄 Chargement modèle Whisper: {self.model_size}")
            self.model = whisper.load_model(self.model_size, device=self.device)
            self.is_loaded = True
            logger.info("✅ Modèle Whisper chargé avec succès")
        except Exception as e:
            logger.error(f"❌ Erreur chargement Whisper: {e}")
            self.is_loaded = False
    
    def transcribe_audio(self, 
                        audio_path: str, 
                        language: Optional[str] = None,
                        task: str = "transcribe") -> Dict[str, Any]:
        """Transcrire un fichier audio"""
        if not self.is_loaded or self.model is None:
            return {"error": "Modèle Whisper non chargé", "success": False}
        
        try:
            start_time = time.time()
            
            # Options de transcription
            options = {
                "task": task,
                "fp16": False  # Plus stable sur CPU
            }
            
            if language:
                options["language"] = language
            
            # Transcription
            result = self.model.transcribe(audio_path, **options)
            
            processing_time = time.time() - start_time
            
            return {
                "text": result.get("text", "").strip(),
                "language": result.get("language", "unknown"),
                "confidence": self._calculate_confidence(result),
                "processing_time": round(processing_time, 2),
                "success": True,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"❌ Erreur transcription: {e}")
            return {
                "error": str(e),
                "success": False,
                "timestamp": datetime.now().isoformat()
            }
    
    def transcribe_audio_stream(self, 
                               audio_chunk: np.ndarray,
                               sample_rate: int = 16000,
                               language: Optional[str] = None) -> Dict[str, Any]:
        """Transcrire un chunk audio en streaming"""
        if not self.is_loaded:
            return {"error": "Modèle non chargé", "success": False}
        
        try:
            # Sauvegarder le chunk temporairement
            import soundfile as sf
            
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_file:
                temp_path = temp_file.name
            
            # Sauvegarder le chunk audio
            sf.write(temp_path, audio_chunk, sample_rate)
            
            # Transcrire
            result = self.transcribe_audio(temp_path, language)
            
            # Nettoyer
            try:
                os.unlink(temp_path)
            except:
                pass
            
            return result
            
        except Exception as e:
            logger.error(f"❌ Erreur transcription streaming: {e}")
            return {"error": str(e), "success": False}
    
    def _calculate_confidence(self, result: Dict[str, Any]) -> float:
        """Calculer un score de confiance basé sur les segments"""
        try:
            segments = result.get("segments", [])
            if not segments:
                return 0.0
            
            # Moyenne des probabilités des segments
            confidences = [seg.get("confidence", 0.0) for seg in segments if seg.get("confidence")]
            if confidences:
                return round(sum(confidences) / len(confidences), 3)
            else:
                return 0.5  # Valeur par défaut
                
        except:
            return 0.0
    
    def get_available_models(self) -> List[str]:
        """Liste des modèles disponibles"""
        return ["tiny", "base", "small", "medium", "large"]
    
    def get_model_info(self) -> Dict[str, Any]:
        """Informations sur le modèle actuel"""
        return {
            "model_size": self.model_size,
            "is_loaded": self.is_loaded,
            "device": self.device,
            "available_models": self.get_available_models()
        }
    
    def change_model(self, model_size: str) -> bool:
        """Changer de modèle Whisper"""
        try:
            if model_size not in self.get_available_models():
                logger.error(f"❌ Modèle non disponible: {model_size}")
                return False
            
            logger.info(f"🔄 Changement vers modèle: {model_size}")
            self.model = whisper.load_model(model_size, device=self.device)
            self.model_size = model_size
            logger.info(f"✅ Modèle changé: {model_size}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Erreur changement modèle: {e}")
            return False

# Instance globale
_whisper_service = None

def get_whisper_service(model_size: str = "base") -> WhisperStreamingService:
    """Obtenir l'instance du service Whisper"""
    global _whisper_service
    if _whisper_service is None:
        _whisper_service = WhisperStreamingService(model_size)
    return _whisper_service

def transcribe_audio_file(audio_path: str, **kwargs) -> Dict[str, Any]:
    """Fonction utilitaire pour transcrire un fichier audio"""
    service = get_whisper_service()
    return service.transcribe_audio(audio_path, **kwargs)