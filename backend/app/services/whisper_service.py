import subprocess
"""Service Whisper pour la transcription audio avec VAD (Silero).

Ce service charge Whisper et applique optionnellement un Voice Activity
Detection (Silero VAD) pour retirer les zones de silence/bruit avant la
transcription. Le chargement est paresseux pour laisser démarrer le serveur
même si `openai-whisper`/`torch`/`silero-vad` ne sont pas encore installés.
"""
import logging
import os
import tempfile
from typing import Optional, Dict, Any

import numpy as np

try:
    import torch
    import torchaudio
    TORCH_AVAILABLE = True
except Exception:  # torch/torchaudio optionnels
    TORCH_AVAILABLE = False
    torch = None  # type: ignore
    torchaudio = None  # type: ignore

logger = logging.getLogger(__name__)


class WhisperService:
    def __init__(self, model_size: str = "base"):
        """
        Initialise le service Whisper.
        
        Args:
            model_size: tiny, base, small, medium, large
        """
        self.model_size = model_size
        self.model = None
        self.vad_model = None
        self.vad_utils = None
        self.vad_sample_rate = 16000
        self._models_loaded = False
        self.supported_languages = ["fr", "en", "es", "de", "it", "pt", "ar", "zh"]

    def convert_audio_format(self, input_path: str, output_ext: str = ".wav") -> str:
        """
        Convertit un fichier audio en .wav mono 16kHz (format attendu par Whisper).
        Nécessite ffmpeg installé sur le système.
        """
        output_path = input_path.rsplit('.', 1)[0] + output_ext
        try:
            subprocess.run([
                "ffmpeg", "-y", "-i", input_path, "-ar", "16000", "-ac", "1", output_path
            ], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            return output_path
        except Exception as e:
            raise RuntimeError(f"Erreur conversion audio: {e}")
    
    def ensure_models_loaded(self):
        """Charge les modèles une seule fois, à la première utilisation."""
        if not self._models_loaded:
            self._load_model()
            self._load_vad()
            self._models_loaded = True
    
    def _load_model(self):
        """Charge le modèle Whisper si disponible.

        N'élève pas d'exception bloquante au démarrage pour permettre au
        serveur de démarrer sans Whisper. Les endpoints vérifieront la
        disponibilité du modèle à l'exécution.
        """
        try:
            import whisper  # import paresseux
            logger.info(f"Chargement du modèle Whisper ({self.model_size})...")
            self.model = whisper.load_model(self.model_size)
            logger.info("✅ Modèle Whisper chargé")
        except ImportError:
            self.model = None
            logger.warning(
                "Whisper n'est pas installé. Installez `openai-whisper` et `torch` pour activer la transcription."
            )
        except Exception as e:
            self.model = None
            logger.error(f"❌ Erreur lors du chargement de Whisper: {e}")

    def _load_vad(self):
        """Charge Silero VAD via torch.hub si disponible.

        En cas d'échec, le service continue sans VAD (fallback silencieux).
        """
        if not TORCH_AVAILABLE:
            logger.warning("Silero VAD non chargé: torch/torchaudio indisponibles")
            return

        try:
            self.vad_model, self.vad_utils = torch.hub.load(  # type: ignore[attr-defined]
                repo_or_dir="snakers4/silero-vad",
                model="silero_vad",
                trust_repo=True,
            )
            logger.info("✅ Silero VAD chargé")
        except Exception as e:  # torch.hub peut échouer sans réseau
            self.vad_model, self.vad_utils = None, None
            logger.warning(f"⚠️ Silero VAD indisponible (fallback sans VAD): {e}")
    
    async def transcribe(
        self,
        audio_path: str,
        language: Optional[str] = None,
        task: str = "transcribe",
        apply_vad: bool = True,
        medical_context: bool = True,
    ) -> Dict[str, Any]:
        """
        Transcrit un fichier audio. Si contexte médical, force le modèle large et la langue française.
        """
        try:
            # Charger les modèles à la première utilisation
            self.ensure_models_loaded()
            
            # Si contexte médical, on force le modèle large et la langue française
            if medical_context:
                import whisper
                if self.model_size != "large":
                    logger.info("[STT] Chargement du modèle Whisper large pour contexte médical...")
                    self.model = whisper.load_model("large")
                    self.model_size = "large"
                language = language or "fr"
            if self.model is None:
                raise RuntimeError(
                    "Whisper indisponible. Installez `openai-whisper`/`torch` et redémarrez le serveur."
                )
            logger.info(f"Transcription de {audio_path}...")

            path_for_asr, vad_temp = self._maybe_apply_vad(audio_path) if apply_vad else (audio_path, None)

            result = self.model.transcribe(
                path_for_asr,
                language=language,
                task=task,
                fp16=False,  # CPU safe
                verbose=False
            )
            # Post-traitement pour corriger les fautes courantes médicales
            text = result["text"]
            text = self._postprocess_medical_text(text) if medical_context else text
            out = {
                "text": text,
                "language": result.get("language", "unknown"),
                "confidence": 0.95,  # Whisper ne donne pas de score direct
                "segments": result.get("segments", [])
            }
            if vad_temp:
                try:
                    os.unlink(vad_temp)
                except Exception:
                    pass

            return out
        except Exception as e:
            logger.error(f"❌ Erreur transcription: {e}")
            raise

    def _postprocess_medical_text(self, text: str) -> str:
        """Corrige les fautes courantes et nettoie le texte médical transcrit."""
        corrections = {
            "fiévre": "fièvre",
            "paracétamole": "paracétamol",
            "paracetamol": "paracétamol",
            "doliprane": "Doliprane",
            "mal de gorge": "mal de gorge",
            "toux": "toux",
            "douleur": "douleur",
            "température": "température",
            "patient": "patient",
            # Ajoutez ici d'autres corrections spécifiques à votre domaine
        }
        for wrong, right in corrections.items():
            text = text.replace(wrong, right)
        # Nettoyage espaces
        text = text.strip()
        return text
    
    async def transcribe_from_bytes(
        self,
        audio_bytes: bytes,
        language: Optional[str] = None,
        apply_vad: bool = True,
    ) -> Dict[str, Any]:
        """Transcrit depuis des bytes audio."""
        import tempfile
        import os
        
        try:
            # Sauvegarder temporairement
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
                f.write(audio_bytes)
                temp_path = f.name
            
            result = await self.transcribe(temp_path, language, apply_vad=apply_vad)
            
            # Nettoyage
            os.remove(temp_path)
            
            return result
        
        except Exception as e:
            logger.error(f"❌ Erreur transcription bytes: {e}")
            raise

    def _maybe_apply_vad(self, audio_path: str) -> tuple[str, Optional[str]]:
        """Applique Silero VAD si disponible; retourne (path_utilisé, temp_path_vad)."""
        if not (self.vad_model and self.vad_utils and TORCH_AVAILABLE):
            return audio_path, None

        try:
            read_audio = self.vad_utils["read_audio"]
            get_speech_timestamps = self.vad_utils["get_speech_timestamps"]
            collect_chunks = self.vad_utils["collect_chunks"]

            wav = read_audio(audio_path, sampling_rate=self.vad_sample_rate)
            speech_timestamps = get_speech_timestamps(wav, self.vad_model, sampling_rate=self.vad_sample_rate)

            if not speech_timestamps:
                logger.info("VAD: aucun segment détecté, on garde l'audio complet")
                return audio_path, None

            speech = collect_chunks(speech_timestamps, wav)

            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
                vad_path = f.name
            torchaudio.save(vad_path, speech.unsqueeze(0), self.vad_sample_rate)
            logger.info("VAD: audio tronqué sur la parole (%d segments)", len(speech_timestamps))
            return vad_path, vad_path

        except Exception as e:
            logger.warning(f"VAD désactivé pour cette requête (fallback audio brut): {e}")
            return audio_path, None
