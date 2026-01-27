
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.services.tts_service import tts_service
from app.services.llm_service import real_llm_service
import logging

# Prefix must match what frontend expects
router = APIRouter(prefix="/api/auriance/voice", tags=["Voice Assistant"])
logger = logging.getLogger(__name__)

class VoiceChatRequest(BaseModel):
    message: str
    language: str = "fr-FR"

@router.post("/chat")
async def chat_voice(request: VoiceChatRequest):
    """
    1. Reçoit un message texte (transcrit depuis le micro).
    2. Envoie au LLM pour avoir une réponse intelligente.
    3. Transforme la réponse en AUDIO (MP3).
    4. Retourne l'URL de l'audio + le texte.
    """
    try:
        user_text = request.message
        logger.info(f"🎤 Voice Chat User: {user_text}")

        # 1. Obtenir la réponse intelligente (LLM)
        # On utilise le service LLM existant
        ai_response_text = await real_llm_service.generate_health_response(
            user_query=user_text, 
            context="", 
            target_language=request.language
        )
        logger.info(f"🤖 AI Response: {ai_response_text}")

        # 2. Générer l'audio (TTS)
        # On limite la taille et on nettoie le texte pour éviter les erreurs TTS (emojis)
        import re
        clean_text = re.sub(r'[^\w\s,.\'?!-]', '', ai_response_text) # Garde seulement les caractères basiques
        speech_text = clean_text[:500] 
        
        audio_url = await tts_service.generate_speech(
            text=speech_text, 
            language=request.language
        )

        if not audio_url:
            logger.warning("⚠️ Echec de la génération audio (TTS returned None), envoi du texte seul.")
            
        return {
            "success": True,
            "user_text": user_text,
            "ai_text": ai_response_text,
            "audio_url": audio_url  # Peut être None, le frontend devra gérer
        }

    except Exception as e:
        logger.error(f"❌ Error Voice Chat: {e}")
        # En cas d'erreur grave (tout a planté), on renvoie quand même une 200 avec le message d'erreur
        # pour que le chat l'affiche proprement
        return {
            "success": False,
            "detail": str(e),
            "ai_text": "Désolé, une erreur technique est survenue."
        }
