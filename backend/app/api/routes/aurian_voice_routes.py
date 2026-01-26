# Fichier: backend/app/api/routes/aurian_voice_routes.py

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Dict

# Import des services
from ...services.voice.voice_service import VoiceService
from ...services.health.aurian_health_service import AurianHealthService
from ...models.aurian_schemas import VoiceChatRequest, VoiceChatResponse

# Définition du routeur FastAPI
router = APIRouter(
    prefix="/aurian/voice",
    tags=["Voice & RAG"],
)

# Initialisation des services (simplifiée, en production utiliser l'injection de dépendances)
voice_service = VoiceService()
health_service = AurianHealthService()

@router.post(
    "/chat",
    response_model=VoiceChatResponse,
    status_code=status.HTTP_200_OK,
    summary="Flux vocal complet: Audio -> STT -> RAG Chat -> TTS -> Audio"
)
async def process_voice_chat(request: VoiceChatRequest):
    """
    Gère la requête audio complète de l'infirmier/patient :
    1. Transcrit l'audio en texte (STT).
    2. Utilise le texte pour obtenir une réponse RAG augmentée (Chat Santé).
    3. Synthétise la réponse en audio (TTS).
    4. Retourne le texte et l'audio au client (front-end).
    """
    try:
        # Étape 1: Reconnaissance Vocale (STT)
        transcribed_text = voice_service.transcribe_audio(
            audio_data_base64=request.audio_data, 
            mime_type=request.mime_type
        )
        
        # Étape 2: Réponse RAG Augmentée (Cœur de l'Agent IA)
        rag_response_text = health_service.get_rag_response(
            user_query=transcribed_text,
            user_id=request.user_id # Utiliser l'ID utilisateur pour la sécurité/accès aux dossiers
        )
        
        # Étape 3: Synthèse Vocale (TTS)
        tts_result = voice_service.synthesize_speech(
            text_to_speak=rag_response_text, 
            voice_name="Kore"
        )
        
        # Étape 4: Retour de la réponse complète
        return VoiceChatResponse(
            text_response=rag_response_text,
            audio_data=tts_result["audio_data"],
            mime_type=tts_result["mime_type"]
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur interne lors du traitement vocal et RAG: {str(e)}"
        )
