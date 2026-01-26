from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
import os
import tempfile
import uuid
from datetime import datetime
from typing import Optional

from app.services.whisper_service import WhisperService
from app.core.aurian_engine import aurian_engine  # Notre moteur IA

whisper_service = WhisperService()

router = APIRouter(prefix="/api/voice", tags=["Reconnaissance Vocale"])

@router.post("/transcribe")
async def transcribe_audio(
    background_tasks: BackgroundTasks,
    audio_file: UploadFile = File(..., description="Fichier audio à transcrire"),
    language: Optional[str] = Form("auto", description="Langue (fr, en, es, zh, ar) ou 'auto'"),
    model_size: str = Form("base", description="Taille modèle (tiny, base, small, medium, large)"),
    medical_context: bool = Form(True, description="Optimisation pour contexte médical"),
    apply_vad: bool = Form(True, description="Activer Silero VAD (anti-bruit)")
):
    """Endpoint de transcription audio professionnel"""
    try:
        # Validation du fichier
        if not audio_file.content_type.startswith('audio/'):
            raise HTTPException(400, "Le fichier doit être un fichier audio")
        
        # Création fichier temporaire
        file_ext = os.path.splitext(audio_file.filename)[1] or ".wav"
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as temp_file:
            temp_path = temp_file.name
        
        # Sauvegarde du fichier uploadé
        content = await audio_file.read()
        with open(temp_path, "wb") as f:
            f.write(content)
        
        # Conversion audio si nécessaire
        converted_path = whisper_service.convert_audio_format(temp_path)
        # Transcription (avec ou sans VAD)
        try:
            transcription_result = await whisper_service.transcribe(
                audio_path=converted_path,
                language=language if language != "auto" else None,
                apply_vad=apply_vad,
                medical_context=medical_context
            )
            # Log du texte reconnu et langue
            import logging
            logging.getLogger("uvicorn.info").info(f"[STT] Texte: {transcription_result['text']} | Langue: {transcription_result['language']}")
            result = {
                "success": True,
                "transcription": transcription_result,
                "file_info": {
                    "original_name": audio_file.filename,
                    "size": len(content),
                    "duration": "N/A"
                }
            }
        except Exception as e:
            result = {
                "success": False,
                "error": str(e),
                "file_info": {
                    "original_name": audio_file.filename,
                    "size": len(content),
                    "duration": "N/A"
                }
            }
        # Nettoyage des fichiers temporaires
        background_tasks.add_task(cleanup_temp_files, [temp_path, converted_path])
        return result
        
    except Exception as e:
        raise HTTPException(500, f"Erreur transcription: {str(e)}")

@router.post("/transcribe-and-analyze")
async def transcribe_and_analyze(
    background_tasks: BackgroundTasks,
    audio_file: UploadFile = File(...),
    language: str = Form("auto")
):
    """Transcription + analyse IA en une seule requête"""
    try:
        # Étape 1: Transcription
        transcription_response = await transcribe_audio(
            background_tasks, audio_file, language, "base", True
        )
        
        if not transcription_response["success"]:
            return transcription_response
        
        transcription = transcription_response["transcription"]
        text = transcription["text"]
        
        # Étape 2: Analyse par l'IA Aurian
        if text.strip():
            # Détection d'intention
            intent = aurian_engine.detect_intent(text, transcription["language"])
            
            # Génération de réponse
            ai_response = aurian_engine.generate_professional_response(
                message=text,
                intent=intent["intent"],
                user_lang=transcription["language"]
            )
        else:
            ai_response = "Je n'ai pas bien compris l'audio. Pouvez-vous répéter ?"
        
        return {
            "success": True,
            "transcription": transcription,
            "ai_analysis": {
                "detected_intent": intent,
                "response": ai_response,
                "medical_terms": transcription.get("medical_terms_detected", [])
            }
        }
        
    except Exception as e:
        raise HTTPException(500, f"Erreur analyse: {str(e)}")

@router.get("/supported-languages")
async def get_supported_languages():
    """Liste des langues supportées"""
    available_models = getattr(whisper_service, "models", None)
    if isinstance(available_models, dict):
        models_loaded = list(available_models.keys())
    else:
        models_loaded = [whisper_service.model_size] if whisper_service.model is not None else []
    supported_languages = getattr(whisper_service, "supported_languages", None) or []
    return {
        "languages": supported_languages,
        "models_loaded": models_loaded,
        "medical_terms_count": len(whisper_service.medical_terms)
    }

@router.post("/detect-language")
async def detect_language_only(
    background_tasks: BackgroundTasks,
    audio_file: UploadFile = File(...)
):
    """Détection de langue uniquement"""
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_file:
            temp_path = temp_file.name
        
        content = await audio_file.read()
        with open(temp_path, "wb") as f:
            f.write(content)
        
        lang_info = whisper_service.detect_language(temp_path)
        
        background_tasks.add_task(cleanup_temp_files, [temp_path])
        
        return {
            "success": True,
            "language_detection": lang_info
        }
        
    except Exception as e:
        raise HTTPException(500, f"Erreur détection langue: {str(e)}")

def cleanup_temp_files(file_paths: list):
    """Nettoie les fichiers temporaires"""
    for path in file_paths:
        try:
            if os.path.exists(path):
                os.unlink(path)
        except Exception as e:
            print(f"⚠️ Erreur nettoyage {path}: {e}")

@router.get("/health")
async def voice_health_check():
    """Statut du service vocal"""
    available_models = getattr(whisper_service, "models", None)
    if isinstance(available_models, dict):
        models_status = {
            size: "loaded" if size in available_models else "not_loaded"
            for size in ["tiny", "base", "small", "medium", "large"]
        }
    else:
        # Fallback for WhisperService implementation without `.models`
        models_status = {
            size: "loaded" if whisper_service.model is not None else "not_loaded"
            for size in ["tiny", "base", "small", "medium", "large"]
        }
    
    supported_languages = getattr(whisper_service, "supported_languages", None) or []
    return {
        "service": "Whisper Voice Recognition",
        "status": "healthy",
        "models_loaded": models_status,
        "supported_languages": len(supported_languages),
        "timestamp": datetime.now().isoformat()
    }