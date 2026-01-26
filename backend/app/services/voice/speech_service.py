import speech_recognition as sr
import io
import aiofiles
from pydub import AudioSegment
import logging
import os

logger = logging.getLogger(__name__)

class SpeechRecognitionService:
    """Service de reconnaissance vocale compatible Python 3.13"""
    
    def __init__(self):
        self.recognizer = sr.Recognizer()
        self.recognizer.energy_threshold = 300
        self.recognizer.dynamic_energy_threshold = True
    
    async def transcribe_audio(self, audio_path: str, language: str = "fr-FR") -> str:
        """
        Transcrire un fichier audio en texte
        
        Args:
            audio_path: Chemin du fichier audio
            language: Langue pour la transcription
        """
        try:
            # Convertir le fichier en format WAV si nécessaire
            if not audio_path.endswith('.wav'):
                audio = AudioSegment.from_file(audio_path)
                wav_path = audio_path.replace(os.path.splitext(audio_path)[1], '.wav')
                audio.export(wav_path, format='wav')
                audio_path = wav_path
            
            # Utiliser speech_recognition
            with sr.AudioFile(audio_path) as source:
                audio_data = self.recognizer.record(source)
                text = self.recognizer.recognize_google(audio_data, language=language)
                
            logger.info(f"Audio transcrit avec succès: {len(text)} caractères")
            return text
            
        except sr.UnknownValueError:
            logger.error("Reconnaissance vocale: audio non compris")
            return "Désolé, je n'ai pas pu comprendre l'audio"
        except sr.RequestError as e:
            logger.error(f"Erreur service reconnaissance vocale: {e}")
            return f"Erreur du service de reconnaissance: {e}"
        except Exception as e:
            logger.error(f"Erreur transcription audio: {e}")
            return f"Erreur lors de la transcription: {e}"
    
    async def transcribe_audio_bytes(self, audio_bytes: bytes, language: str = "fr-FR") -> str:
        """
        Transcrire des bytes audio en texte
        """
        try:
            # Convertir les bytes en AudioData
            audio_segment = AudioSegment.from_file(io.BytesIO(audio_bytes))
            wav_io = io.BytesIO()
            audio_segment.export(wav_io, format='wav')
            wav_io.seek(0)
            
            # Utiliser speech_recognition
            with sr.AudioFile(wav_io) as source:
                audio_data = self.recognizer.record(source)
                text = self.recognizer.recognize_google(audio_data, language=language)
            
            return text
            
        except Exception as e:
            logger.error(f"Erreur transcription bytes audio: {e}")
            return f"Erreur lors de la transcription: {e}"

# Instance globale
speech_service = SpeechRecognitionService()