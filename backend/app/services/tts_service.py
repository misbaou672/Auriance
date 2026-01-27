
import logging
import os
import uuid
import edge_tts
import asyncio
from typing import Optional

logger = logging.getLogger(__name__)

class TTSService:
    """
    Service de synthèse vocale utilisant Edge-TTS (gratuit, haute qualité).
    Génère des fichiers MP3 à partir de texte.
    """
    
    def __init__(self, output_dir: str = "static/audio"):
        self.output_dir = output_dir
        # Créer le dossier s'il n'existe pas
        if not os.path.exists(self.output_dir):
            os.makedirs(self.output_dir, exist_ok=True)
            
        # Voix par défaut (M = Male, F = Female)
        self.voices = {
            "fr-FR": "fr-FR-HenriNeural",      # Homme FR
            "en-US": "en-US-ChristopherNeural", # Homme US
            "es-ES": "es-ES-AlvaroNeural",      # Homme ES
            "fr-FR-F": "fr-FR-DeniseNeural",    # Femme FR
            "en-US-F": "en-US-AriaNeural",      # Femme US
        }

    async def generate_speech(self, text: str, language: str = "fr-FR", gender: str = "M") -> Optional[str]:
        """
        Génère un fichier audio pour le texte donné.
        Retourne le chemin relatif du fichier généré ou None en cas d'erreur.
        """
        try:
            # Sélection de la voix
            voice_key = f"{language}-{gender}" if gender == "F" else language
            voice = self.voices.get(voice_key, self.voices.get("fr-FR"))
            
            # Nom de fichier unique
            filename = f"speech_{uuid.uuid4()}.mp3"
            filepath = os.path.join(self.output_dir, filename)
            
            # Génération avec Edge TTS
            communicate = edge_tts.Communicate(text, voice)
            await communicate.save(filepath)
            
            logger.info(f"✅ Audio généré: {filepath} (Voix: {voice})")
            
            # Retourner le chemin relatif pour l'URL (ex: /static/audio/xyz.mp3)
            return f"/static/audio/{filename}"
            
        except Exception as e:
            logger.error(f"❌ Erreur TTS: {e}")
            return None

    def get_available_voices(self):
        return self.voices

# Instance globale
tts_service = TTSService()
